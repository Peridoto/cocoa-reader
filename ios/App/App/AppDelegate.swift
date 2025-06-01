import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Create window for all iOS versions
        setupWindow()
        
        return true
    }
    
    private func setupWindow() {
        // Create the window and use the storyboard approach for Capacitor 7
        window = UIWindow(frame: UIScreen.main.bounds)
        
        // Load the main storyboard and get the initial view controller
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let rootViewController = storyboard.instantiateInitialViewController()!
        rootViewController.view.backgroundColor = UIColor(red: 0.39, green: 0.20, blue: 0.92, alpha: 1.0)
        
        window?.rootViewController = rootViewController
        window?.makeKeyAndVisible()
    }

    // MARK: URL Handling for Share Target

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a URL.
        print("📱 AppDelegate: Received URL: \(url)")
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity.
        print("📱 AppDelegate: Received user activity: \(userActivity.activityType)")
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
