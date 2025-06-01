import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        window = UIWindow(windowScene: windowScene)
        
        // Configure the bridge using modern Capacitor 7 API
        let bridge = CAPBridge()
        let rootViewController = bridge.viewController
        rootViewController.view.backgroundColor = UIColor(red: 0.39, green: 0.20, blue: 0.92, alpha: 1.0) // #6366f1
        
        // Set the root view controller
        window?.rootViewController = rootViewController
        window?.makeKeyAndVisible()
        
        // Handle any URLs passed during initial connection
        if let urlContext = connectionOptions.urlContexts.first {
            handleIncomingURL(urlContext.url)
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        // Handle URLs when the app is already running
        if let url = URLContexts.first?.url {
            print("📱 SceneDelegate: Received URL: \(url)")
            handleIncomingURL(url)
        }
    }
    
    private func handleIncomingURL(_ url: URL) {
        // This will be handled by our URLHandler component in the web view
        print("📱 SceneDelegate: Processing URL: \(url)")
        // The URL will be automatically passed to the web view through Capacitor
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
