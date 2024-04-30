//
//  test.swift
//  IOS
//
//  Created by 刘茗 on 2024/4/28.
//

import SwiftUI

struct TestView: View {
    @State private var favoritesData: [[String: Any]] = [["ticker": "AAPL", "name": "Apple Inc.", "c": 150.0, "d": 10.0, "dp": 5.0],
                                                         ["ticker": "GOOGL", "name": "Alphabet Inc.", "c": 2500.0, "d": -5.0, "dp": -2.0],
                                                         ["ticker": "MSFT", "name": "Microsoft Corporation", "c": 300.0, "d": 8.0, "dp": 3.0]]

//    var body: some View {
//        List {
//            ForEach(favoritesData.indices, id: \.self) { index in
//                let favorite = favoritesData[index]
//                Text("\(favorite["ticker"] ?? "") - \(favorite["name"] ?? "")")
//            }
//            .onMove(perform: { indices, newOffset in
//                                favoritesData.move(fromOffsets: indices, toOffset: newOffset)
//                            })
//        }
//    }
//
//    func move(from source: IndexSet, to destination: Int) {
//        favoritesData.move(fromOffsets: source, toOffset: destination)
//    }
    @State private var users = ["Glenn", "Malcolm", "Nicola", "Terri"]

        var body: some View {
            NavigationStack {
                List($users, id: \.self, editActions: .move) { $user in
                    Text(user)
                }
            }
        }
    
}
#Preview {
    TestView()
}
