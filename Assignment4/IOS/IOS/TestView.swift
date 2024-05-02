//
//  test.swift
//  IOS
//
//  Created by 刘茗 on 2024/4/28.
//

import SwiftUI

struct TestView: View {
    @Binding var preNavigationBarHidden: Bool
    @State private var isNavigationBarHidden = false
    var body: some View {
        NavigationView {
            VStack {
                
                // 使用NavigationLink来实现导航
                NavigationLink(destination: TestView(preNavigationBarHidden: $isNavigationBarHidden)) {
                    Text("Go to Next View")
                }
                .simultaneousGesture(TapGesture().onEnded {
                    isNavigationBarHidden = true
                })
            }
        }.navigationBarHidden(isNavigationBarHidden)
            .onDisappear{preNavigationBarHidden = false}
    }
}

//struct NextView: View {
//    var body: some View {
//        Text("Next View")
//            .navigationBarTitle("Next View")
//            .onAppear {
//                // 在NextView显示时，将原先的导航栏隐藏
//                UIApplication.shared.windows.first?.rootViewController?.navigationController?.setNavigationBarHidden(true, animated: false)
//            }
//            .onDisappear {
//                // 在NextView消失时，将原先的导航栏重新显示
//                UIApplication.shared.windows.first?.rootViewController?.navigationController?.setNavigationBarHidden(false, animated: false)
//            }
//    }
//}
#Preview {
    TestView(preNavigationBarHidden: .constant(true))
}
