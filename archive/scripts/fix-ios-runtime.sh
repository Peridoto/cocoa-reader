#!/bin/bash

# iOS UIKit and Runtime Fixes Script
echo "🍎 Fixing iOS UIKit and Runtime Issues..."
echo "========================================="

# 1. Create SceneDelegate.swift if it doesn't exist
SCENE_DELEGATE_PATH="ios/App/App/SceneDelegate.swift"

if [ ! -f "$SCENE_DELEGATE_PATH" ]; then
    echo "📱 Creating SceneDelegate.swift for UIScene lifecycle..."
    cat > "$SCENE_DELEGATE_PATH" << 'EOF'
import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        window = UIWindow(windowScene: windowScene)
        
        // Configure the bridge
        let bridge = CAPBridge(with: self)
        bridge.instanceDescriptor = "CAPBridge"
        bridge.webView?.backgroundColor = UIColor(red: 0.39, green: 0.20, blue: 0.92, alpha: 1.0) // #6366f1
        
        // Set the root view controller
        window?.rootViewController = bridge.viewController
        window?.makeKeyAndVisible()
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        // Called as the scene is being released by the system.
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Called when the scene has moved from an inactive state to an active state.
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // Called when the scene will move from an active state to an inactive state.
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // Called as the scene transitions from the background to the foreground.
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Called as the scene transitions from the foreground to the background.
    }
}

extension SceneDelegate: CAPBridgeDelegate {
    func capacitorDidLoad() {
        // Optional: Perform any additional setup after Capacitor has loaded
    }
}
EOF
    echo "✅ SceneDelegate.swift created"
else
    echo "✅ SceneDelegate.swift already exists"
fi

# 2. Update the main AppDelegate.swift to work with SceneDelegate
APPDELEGATE_PATH="ios/App/App/AppDelegate.swift"

if [ -f "$APPDELEGATE_PATH" ]; then
    echo "📱 Updating AppDelegate.swift for UIScene compatibility..."
    cat > "$APPDELEGATE_PATH" << 'EOF'
import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    // MARK: UISceneSession Lifecycle

    @available(iOS 13.0, *)
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        // Called when a new scene session is being created.
        // Use this method to select a configuration to create the new scene with.
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }

    @available(iOS 13.0, *)
    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session.
    }

    // Handle URL schemes for sharing
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a URL.
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity.
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    // For iOS < 13.0 compatibility (fallback)
    func applicationDidBecomeActive(_ application: UIApplication) {
        // For older iOS versions without scene support
        if #unavailable(iOS 13.0) {
            if window == nil {
                let bridge = CAPBridge(with: self)
                bridge.instanceDescriptor = "CAPBridge"
                bridge.webView?.backgroundColor = UIColor(red: 0.39, green: 0.20, blue: 0.92, alpha: 1.0)
                
                window = UIWindow(frame: UIScreen.main.bounds)
                window?.rootViewController = bridge.viewController
                window?.makeKeyAndVisible()
            }
        }
    }
}

// Fallback for iOS < 13.0
extension AppDelegate: CAPBridgeDelegate {
    func capacitorDidLoad() {
        // Optional: Perform any additional setup after Capacitor has loaded
    }
}
EOF
    echo "✅ AppDelegate.swift updated for UIScene support"
fi

echo ""
echo "🔧 iOS Runtime Fixes Applied:"
echo "   ✅ UIScene lifecycle configuration added"
echo "   ✅ SceneDelegate created for modern iOS versions"  
echo "   ✅ AppDelegate updated with backward compatibility"
echo "   ✅ URL scheme handling improved"
echo ""
echo "🚀 Now run: npx cap sync ios && npx cap open ios"
echo "   The UIScene warnings should be resolved!"
