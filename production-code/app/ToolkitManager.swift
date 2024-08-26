//
//  ToolkitManager.swift
//  Preply
//
//  Created by Yurii Kliuiev on 26.06.2022.
//
import UIKit
import Foundation
import AVFoundation

@objc(ToolkitManager)
class ToolkitManager: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  private func traverseViewHierarchy(view: UIView) -> [String: Any] {
    var children: [[String: Any]] = []

    for subview in view.subviews {
      let childInfo = traverseViewHierarchy(view: subview)
      children.append(childInfo)
    }


    let viewInfo: [String: Any] = [
      "left": view.frame.origin.x,
      "top": view.frame.origin.y,
      "width": view.frame.size.width,
      "height": view.frame.size.height,
      "accessibilityLabel": view.accessibilityLabel ?? "",
      "accessibilityIdentifier": view.accessibilityIdentifier ?? "",
      "children": children,
      "instanceOf": String(describing: type(of: view)),
    ]

    return viewInfo
  }

  @objc
  func getAllReactNativeComponents(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock) {
      do {
        guard let rootView = UIApplication.shared.keyWindow?.rootViewController?.view else {
          reject("NoRootView", "Could not find the root view", nil)
          return
        }

        let viewportWidth = UIScreen.main.bounds.size.width
        let viewportHeight = UIScreen.main.bounds.size.height

        var rootInfo = traverseViewHierarchy(view: rootView)
        rootInfo["viewportWidth"] = viewportWidth
        rootInfo["viewportHeight"] = viewportHeight

        resolve(rootInfo)
      } catch {
        reject("Toolkit - getVolume", "Failed to get volume \(error)", nil)
      }
    }
}
