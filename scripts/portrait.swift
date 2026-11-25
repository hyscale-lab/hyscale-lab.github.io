// Uniform headshot: detect face, square crop with the face at a fixed size and
// position, gentle auto tone, 800x800 JPEG. Usage: swift portrait.swift in.jpg out.jpg
import Foundation
import CoreImage
import Vision
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let url = URL(fileURLWithPath: args[1]), outURL = URL(fileURLWithPath: args[2])
guard let src = CIImage(contentsOf: url, options: [.applyOrientationProperty: true]) else { fatalError("read") }
let img = src.transformed(by: CGAffineTransform(translationX: -src.extent.minX, y: -src.extent.minY))
let W = img.extent.width, H = img.extent.height

let req = VNDetectFaceRectanglesRequest()
try VNImageRequestHandler(ciImage: img).perform([req])
guard let face = (req.results ?? []).max(by: { $0.boundingBox.width < $1.boundingBox.width }) else { fatalError("no face") }
let fb = face.boundingBox  // normalised, origin bottom-left
let fx = fb.midX * W, fy = fb.midY * H, fw = fb.width * W

// Face width = 38% of crop; face centre at 42% from the top.
var side = min(fw / 0.38, W, H)
var x = fx - side / 2
var y = fy - side * (1 - 0.42)  // bottom edge in CI coords
x = max(0, min(x, W - side)); y = max(0, min(y, H - side))
var out = img.cropped(to: CGRect(x: x, y: y, width: side, height: side))
out = out.transformed(by: CGAffineTransform(translationX: -x, y: -y))

// Gentle auto tone (exposure/contrast/vibrance), no red-eye or crop.
for f in out.autoAdjustmentFilters(options: [.redEye: false, .crop: false, .level: false]) {
  f.setValue(out, forKey: kCIInputImageKey); out = f.outputImage!
}
let s = 800 / side
out = out.applyingFilter("CILanczosScaleTransform", parameters: [kCIInputScaleKey: s, kCIInputAspectRatioKey: 1])
out = out.cropped(to: CGRect(x: 0, y: 0, width: 800, height: 800))

let ctx = CIContext()
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
try ctx.writeJPEGRepresentation(of: out, to: outURL, colorSpace: cs,
  options: [CIImageRepresentationOption(rawValue: kCGImageDestinationLossyCompressionQuality as String): 0.86])
print(args[1], "face", Int(fw), "crop", Int(side))
