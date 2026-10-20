import Foundation
import Vision
import ImageIO

// Usage: ocr <image> [<image> ...]
// Emits one JSON object per line: {"file":..., "lines":[{"text":..,"conf":..,"x":..,"y":..,"w":..,"h":..}]}
// y is normalized Vision coordinate (origin bottom-left).

func recognize(path: String) -> [[String: Any]] {
    guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
          let cg = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
        return []
    }
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.recognitionLanguages = ["ja-JP", "zh-Hans", "en-US"]
    req.usesLanguageCorrection = false
    req.minimumTextHeight = 0.008

    let handler = VNImageRequestHandler(cgImage: cg, options: [:])
    do { try handler.perform([req]) } catch { return [] }

    var out: [[String: Any]] = []
    for case let obs as VNRecognizedTextObservation in (req.results ?? []) {
        guard let c = obs.topCandidates(1).first else { continue }
        let bb = obs.boundingBox
        out.append([
            "text": c.string,
            "conf": Double(c.confidence),
            "x": Double(bb.origin.x),
            "y": Double(bb.origin.y),
            "w": Double(bb.size.width),
            "h": Double(bb.size.height),
        ])
    }
    // Sort top-to-bottom, then left-to-right (Vision y grows upward)
    out.sort { a, b in
        let ay = a["y"] as! Double, by = b["y"] as! Double
        if abs(ay - by) > 0.02 { return ay > by }
        return (a["x"] as! Double) < (b["x"] as! Double)
    }
    return out
}

let files = Array(CommandLine.arguments.dropFirst())
for f in files {
    let obj: [String: Any] = ["file": (f as NSString).lastPathComponent, "lines": recognize(path: f)]
    if let data = try? JSONSerialization.data(withJSONObject: obj, options: []),
       let s = String(data: data, encoding: .utf8) {
        print(s)
    }
}
