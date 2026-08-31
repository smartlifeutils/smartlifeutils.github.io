// Top-left anchored crop. macOS `sips` has a --cropOffset flag but ignores it and
// always crops from the centre, which is no use for cutting the marketing caption
// band off the bottom of a store screenshot or a trailer frame.
//
//   swift tools/crop.swift in.jpg out.jpg <x> <y> <width> <height>
//
// Origin is top-left, units are pixels.
import AppKit
import Foundation

let args = CommandLine.arguments
guard args.count == 7 else {
    FileHandle.standardError.write("usage: crop.swift <in> <out> <x> <y> <w> <h>\n".data(using: .utf8)!)
    exit(2)
}
guard let image = NSImage(contentsOfFile: args[1]),
      let tiff = image.tiffRepresentation,
      let rep = NSBitmapImageRep(data: tiff),
      let source = rep.cgImage else {
    FileHandle.standardError.write("cannot read \(args[1])\n".data(using: .utf8)!)
    exit(1)
}
let rect = CGRect(x: Int(args[3])!, y: Int(args[4])!, width: Int(args[5])!, height: Int(args[6])!)
guard let cropped = source.cropping(to: rect) else {
    FileHandle.standardError.write("crop rect lies outside the image\n".data(using: .utf8)!)
    exit(1)
}
let out = NSBitmapImageRep(cgImage: cropped)
let data = out.representation(using: .jpeg, properties: [.compressionFactor: 0.9])!
try data.write(to: URL(fileURLWithPath: args[2]))
print("\(cropped.width)x\(cropped.height)")
