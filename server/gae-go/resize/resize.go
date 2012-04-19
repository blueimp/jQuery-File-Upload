// Copyright 2011 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package resize

import (
	"image"
	"image/color"
)

// Resize returns a scaled copy of the image slice r of m.
// The returned image has width w and height h.
func Resize(m image.Image, r image.Rectangle, w, h int) image.Image {
	if w < 0 || h < 0 {
		return nil
	}
	if w == 0 || h == 0 || r.Dx() <= 0 || r.Dy() <= 0 {
		return image.NewRGBA64(image.Rect(0, 0, w, h))
	}
	switch m := m.(type) {
	case *image.RGBA:
		return resizeRGBA(m, r, w, h)
	case *image.YCbCr:
		if m, ok := resizeYCbCr(m, r, w, h); ok {
			return m
		}
	}
	ww, hh := uint64(w), uint64(h)
	dx, dy := uint64(r.Dx()), uint64(r.Dy())
	// The scaling algorithm is to nearest-neighbor magnify the dx * dy source
	// to a (ww*dx) * (hh*dy) intermediate image and then minify the intermediate
	// image back down to a ww * hh destination with a simple box filter.
	// The intermediate image is implied, we do not physically allocate a slice
	// of length ww*dx*hh*dy.
	// For example, consider a 4*3 source image. Label its pixels from a-l:
	//	abcd
	//	efgh
	//	ijkl
	// To resize this to a 3*2 destination image, the intermediate is 12*6.
	// Whitespace has been added to delineate the destination pixels:
	//	aaab bbcc cddd
	//	aaab bbcc cddd
	//	eeef ffgg ghhh
	//
	//	eeef ffgg ghhh
	//	iiij jjkk klll
	//	iiij jjkk klll
	// Thus, the 'b' source pixel contributes one third of its value to the
	// (0, 0) destination pixel and two thirds to (1, 0).
	// The implementation is a two-step process. First, the source pixels are
	// iterated over and each source pixel's contribution to 1 or more
	// destination pixels are summed. Second, the sums are divided by a scaling
	// factor to yield the destination pixels.
	// TODO: By interleaving the two steps, instead of doing all of
	// step 1 first and all of step 2 second, we could allocate a smaller sum
	// slice of length 4*w*2 instead of 4*w*h, although the resultant code
	// would become more complicated.
	n, sum := dx*dy, make([]uint64, 4*w*h)
	for y := r.Min.Y; y < r.Max.Y; y++ {
		for x := r.Min.X; x < r.Max.X; x++ {
			// Get the source pixel.
			r32, g32, b32, a32 := m.At(x, y).RGBA()
			r64 := uint64(r32)
			g64 := uint64(g32)
			b64 := uint64(b32)
			a64 := uint64(a32)
			// Spread the source pixel over 1 or more destination rows.
			py := uint64(y) * hh
			for remy := hh; remy > 0; {
				qy := dy - (py % dy)
				if qy > remy {
					qy = remy
				}
				// Spread the source pixel over 1 or more destination columns.
				px := uint64(x) * ww
				index := 4 * ((py/dy)*ww + (px / dx))
				for remx := ww; remx > 0; {
					qx := dx - (px % dx)
					if qx > remx {
						qx = remx
					}
					sum[index+0] += r64 * qx * qy
					sum[index+1] += g64 * qx * qy
					sum[index+2] += b64 * qx * qy
					sum[index+3] += a64 * qx * qy
					index += 4
					px += qx
					remx -= qx
				}
				py += qy
				remy -= qy
			}
		}
	}
	return average(sum, w, h, n*0x0101)
}

// average convert the sums to averages and returns the result.
func average(sum []uint64, w, h int, n uint64) image.Image {
	ret := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			index := 4 * (y*w + x)
			ret.SetRGBA(x, y, color.RGBA{
				uint8(sum[index+0] / n),
				uint8(sum[index+1] / n),
				uint8(sum[index+2] / n),
				uint8(sum[index+3] / n),
			})
		}
	}
	return ret
}

// resizeYCbCr returns a scaled copy of the YCbCr image slice r of m.
// The returned image has width w and height h.
func resizeYCbCr(m *image.YCbCr, r image.Rectangle, w, h int) (image.Image, bool) {
	var verticalRes int
	switch m.SubsampleRatio {
	case image.YCbCrSubsampleRatio420:
		verticalRes = 2
	case image.YCbCrSubsampleRatio422:
		verticalRes = 1
	default:
		return nil, false
	}
	ww, hh := uint64(w), uint64(h)
	dx, dy := uint64(r.Dx()), uint64(r.Dy())
	// See comment in Resize.
	n, sum := dx*dy, make([]uint64, 4*w*h)
	for y := r.Min.Y; y < r.Max.Y; y++ {
		Y := m.Y[y*m.YStride:]
		Cb := m.Cb[y/verticalRes*m.CStride:]
		Cr := m.Cr[y/verticalRes*m.CStride:]
		for x := r.Min.X; x < r.Max.X; x++ {
			// Get the source pixel.
			r8, g8, b8 := color.YCbCrToRGB(Y[x], Cb[x/2], Cr[x/2])
			r64 := uint64(r8)
			g64 := uint64(g8)
			b64 := uint64(b8)
			// Spread the source pixel over 1 or more destination rows.
			py := uint64(y) * hh
			for remy := hh; remy > 0; {
				qy := dy - (py % dy)
				if qy > remy {
					qy = remy
				}
				// Spread the source pixel over 1 or more destination columns.
				px := uint64(x) * ww
				index := 4 * ((py/dy)*ww + (px / dx))
				for remx := ww; remx > 0; {
					qx := dx - (px % dx)
					if qx > remx {
						qx = remx
					}
					qxy := qx * qy
					sum[index+0] += r64 * qxy
					sum[index+1] += g64 * qxy
					sum[index+2] += b64 * qxy
					sum[index+3] += 0xFFFF * qxy
					index += 4
					px += qx
					remx -= qx
				}
				py += qy
				remy -= qy
			}
		}
	}
	return average(sum, w, h, n), true
}

// resizeRGBA returns a scaled copy of the RGBA image slice r of m.
// The returned image has width w and height h.
func resizeRGBA(m *image.RGBA, r image.Rectangle, w, h int) image.Image {
	ww, hh := uint64(w), uint64(h)
	dx, dy := uint64(r.Dx()), uint64(r.Dy())
	// See comment in Resize.
	n, sum := dx*dy, make([]uint64, 4*w*h)
	for y := r.Min.Y; y < r.Max.Y; y++ {
		pixOffset := m.PixOffset(r.Min.X, y)
		for x := r.Min.X; x < r.Max.X; x++ {
			// Get the source pixel.
			r64 := uint64(m.Pix[pixOffset+0])
			g64 := uint64(m.Pix[pixOffset+1])
			b64 := uint64(m.Pix[pixOffset+2])
			a64 := uint64(m.Pix[pixOffset+3])
			pixOffset += 4
			// Spread the source pixel over 1 or more destination rows.
			py := uint64(y) * hh
			for remy := hh; remy > 0; {
				qy := dy - (py % dy)
				if qy > remy {
					qy = remy
				}
				// Spread the source pixel over 1 or more destination columns.
				px := uint64(x) * ww
				index := 4 * ((py/dy)*ww + (px / dx))
				for remx := ww; remx > 0; {
					qx := dx - (px % dx)
					if qx > remx {
						qx = remx
					}
					qxy := qx * qy
					sum[index+0] += r64 * qxy
					sum[index+1] += g64 * qxy
					sum[index+2] += b64 * qxy
					sum[index+3] += a64 * qxy
					index += 4
					px += qx
					remx -= qx
				}
				py += qy
				remy -= qy
			}
		}
	}
	return average(sum, w, h, n)
}

// Resample returns a resampled copy of the image slice r of m.
// The returned image has width w and height h.
func Resample(m image.Image, r image.Rectangle, w, h int) image.Image {
	if w < 0 || h < 0 {
		return nil
	}
	if w == 0 || h == 0 || r.Dx() <= 0 || r.Dy() <= 0 {
		return image.NewRGBA64(image.Rect(0, 0, w, h))
	}
	curw, curh := r.Dx(), r.Dy()
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			// Get a source pixel.
			subx := x * curw / w
			suby := y * curh / h
			r32, g32, b32, a32 := m.At(subx, suby).RGBA()
			r := uint8(r32 >> 8)
			g := uint8(g32 >> 8)
			b := uint8(b32 >> 8)
			a := uint8(a32 >> 8)
			img.SetRGBA(x, y, color.RGBA{r, g, b, a})
		}
	}
	return img
}
