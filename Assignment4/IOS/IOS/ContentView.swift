//
//  ContentView.swift
//  IOS
//
//  Created by 刘茗 on 2024/4/3.
//

import SwiftUI
import Alamofire
import SwiftyJSON

struct UserData: Codable{
    var money: Double
    var portfolio: [String:[Double]]
    var watchlist: [String]
}

struct ContentView: View {
    let tokenF = "cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0"
    @State private var searchText = ""
    @State private var isInputing = false
    @State private var isEditing = false
    @State private var isLoading = true
    @State private var userData: UserData?
    @State private var portfolioData: [[String: Any]] = []
    @State private var favoritesData: [[String: Any]] = []
    @State private var suggestions: [[String: Any]] = []
    @State private var isSuggestionLoading = false
    @State private var listHeight: CGFloat = 0
    
    var body: some View {
        NavigationView {
            ZStack{
                    VStack{
                        if !isInputing {
                            VStack{
                                HStack{
                                    Spacer()
                                    Button(action: {
                                        withAnimation {
                                            isEditing.toggle()
                                        }
                                        UIApplication.shared.endEditing()
                                    }) {
                                        let state = isEditing ? "Done":"Edit"
                                        Text("\(state)")
                                            .foregroundColor(.blue)
                                    }
                                }
                                HStack{
                                    Text("Stocks")
                                        .font(.largeTitle)
                                        .fontWeight(.bold)
                                        .padding(.top, 5)
                                    Spacer()
                                }
                            }
                        }
                        HStack {
                            HStack{
                                HStack{
                                    Image(systemName: "magnifyingglass")
                                        .padding(.leading,6)
                                        .foregroundColor(.gray)
                                    
                                    TextField("Search", text: $searchText)
                                        .padding(.vertical, 8)
                                        .onTapGesture {
                                            withAnimation {
                                                isInputing = true
                                            }
                                        }.onChange(of: searchText) { newValue in
                                            if(searchText != ""){
                                                loadSuggestion()
                                            }
                                        }
                                    if isInputing{
                                        Button(action: {
                                            withAnimation {
                                                searchText = ""
                                                isInputing = false
                                            }
                                            UIApplication.shared.endEditing()
                                        }) {
                                            Image(systemName: "x.circle.fill")
                                                .padding(.trailing, 8)
                                                .foregroundColor(.gray)
                                        }
                                    }
                                }.background(Color.gray.opacity(0.2))
                                    .cornerRadius(8)
                            }
                            if isInputing {
                                Button(action: {
                                    withAnimation {
                                        searchText = ""
                                        isInputing = false
                                    }
                                    UIApplication.shared.endEditing()
                                }) {
                                    Text("Cancel")
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                        if searchText == ""{
                            Divider().hidden()
                            HStack{
                                Text(currentDateFormatted())
                                    .padding(.vertical, 18)
                                    .padding(.leading,18)
                                    .font(.largeTitle)
                                    .fontWeight(.bold)
                                    .foregroundColor(Color.gray)
                                Spacer()
                            }.background(Color.white)
                                .cornerRadius(8)
                            
                            Divider().hidden()
                            Divider().hidden()
                            HStack{
                                Text("PORTFOLIO")
                                    .padding(.leading,10)
                                    .foregroundColor(Color.gray)
                                Spacer()
                            }
                            
                            if(!isLoading && portfolioData.count>0){
                                List {
                                    HStack{
                                        VStack(alignment: .leading) {
                                            Text("Net Worth").font(.system(size: 20))
                                            Text("$\(String(format: "%.2f", calculateWorth()))").fontWeight(.bold).font(.system(size: 20))
                                            
                                        }
                                        Spacer()
                                        VStack(alignment: .leading) {
                                            Text("Cash Balance").font(.system(size: 20))
                                            Text("$\(String(format: "%.2f", userData?.money as? Double ?? 0))").fontWeight(.bold).font(.system(size: 20))
                                        }
                                    }.background(Color.white)
                                        .cornerRadius(8)
                                    ForEach(portfolioData.indices, id: \.self) { index in
                                        if let ticker = portfolioData[index]["ticker"] as? String{
                                            if let history = userData?.portfolio["\(ticker)"] as? [Double]{
                                                if let currentPrice = portfolioData[index]["c"] as? Double{
                                                    let total = history.reduce(0, +)
                                                    let marketVal = Double(history.count) * currentPrice
                                            let change = marketVal - total
                                            let changePercentage = (marketVal - total)/total
                                            let color = change > 0 ? Color.green : (change < 0 ? Color.red :  Color.gray)
                                            let arrowSymbolName = change > 0 ? "arrow.up.right" : (change < 0 ? "arrow.down.right" :  "minus")
                                            let arrowSymbol = Image(systemName: arrowSymbolName)
                                                .foregroundColor(color)
                                            NavigationLink(destination: StockView(sym: "\(ticker)")) {
                                                HStack{
                                                    VStack{
                                                        HStack {
                                                            Text("\(ticker)").fontWeight(.bold).font(.system(size: 20)).foregroundColor(Color.black)
                                                            Spacer()
                                                            Text("$\(String(format: "%.2f",marketVal))").fontWeight(.bold).foregroundColor(Color.black)
                                                        }
                                                        HStack {
                                                            Text("\(userData?.portfolio[ticker]?.count ?? 0) shares").foregroundColor(Color.gray)
                                                            Spacer()
                                                            HStack{
                                                                arrowSymbol
                                                                Text("$\(String(format: "%.2f",abs(change)))"+"(\(String(format: "%.2f",abs(changePercentage*100)))%)")
                                                                    .foregroundColor(color)
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                        }
                                    }.onMove(perform: portfolioMove)
                                }.environment(\.editMode, isEditing ? .constant(.active) : .constant(.inactive))
                                    .padding(.vertical, -30)
                                    .padding(.horizontal, -20)
                                    .background(Color.white)
                                    .cornerRadius(8)
                                
                            }else if(!isLoading){
                                HStack{
                                    VStack(alignment: .leading) {
                                        Text("Net Worth").font(.system(size: 20))
                                        Text("$\(String(format: "%.2f", calculateWorth()))").fontWeight(.bold).font(.system(size: 20))
                                        
                                    }
                                    Spacer()
                                    VStack(alignment: .leading) {
                                        Text("Cash Balance").font(.system(size: 20))
                                        Text("$\(String(format: "%.2f", userData?.money as? Double ?? 0))").fontWeight(.bold).font(.system(size: 20))
                                    }
                                }.padding(.horizontal,20)
                                    .padding(.vertical,10)
                                    .background(Color.white)
                                    .cornerRadius(8)
                            }
                            HStack{
                                Text("FAVORITES")
                                    .padding(.leading,10)
                                    .foregroundColor(Color.gray)
                                Spacer()
                            }
                            if (!isLoading && favoritesData.count>0){
                                List {
                                    ForEach(favoritesData.indices, id: \.self) { index in
//                                        let favorite = favoritesData[index]
                                        let change = favoritesData[index]["d"] as? Double ?? 0
                                        let changePercentage = favoritesData[index]["dp"] as? Double ?? 0
                                        let color = change > 0 ? Color.green : Color.red
                                        let arrowSymbolName = change > 0 ? "arrow.up.right" : "arrow.down.right"
                                        let arrowSymbol = Image(systemName: arrowSymbolName)
                                            .foregroundColor(color)
                                        if let ticker = favoritesData[index]["ticker"] as? String{
                                            NavigationLink(destination: StockView(sym: "\(ticker)")) {
                                                HStack{
                                                    VStack{
                                                        HStack {
                                                            Text("\(ticker)").fontWeight(.bold).font(.system(size: 20)).foregroundColor(Color.black)
                                                            Spacer()
                                                            Text("$\(favoritesData[index]["c"] ?? "")").fontWeight(.bold).foregroundColor(Color.black)
                                                        }
                                                        HStack {
                                                            Text("\(favoritesData[index]["name"] ?? "")").foregroundColor(Color.gray)
                                                            Spacer()
                                                            HStack{
                                                                arrowSymbol
                                                                Text("$\(abs(change))"+"(\(String(format: "%.2f",(abs(changePercentage))))%)")
                                                                    .foregroundColor(color)
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }.onMove(perform: favoriteMove)
                                        .onDelete(perform: delete)
                                }.environment(\.editMode, isEditing ? .constant(.active) : .constant(.inactive))
                                .padding(.vertical, -30)
                                    .padding(.horizontal, -20)
                                    .background(Color.white)
                                    .cornerRadius(8)
                            }
                            Divider().hidden()
                            Divider().hidden()
                            HStack{
                                Spacer()
                                Text("Powered by Finnhub.io")
                                    .padding(.vertical,10)
                                    .foregroundColor(Color.gray)
                                    .onTapGesture {
                                        if let url = URL(string: "https://finnhub.io/") {
                                            UIApplication.shared.open(url)
                                        }
                                    }
                                Spacer()
                            }.background(Color.white)
                                .cornerRadius(8)
                            Spacer()
                        }else{
                            
                            if(!isSuggestionLoading){
                                GeometryReader { geometry in
                                    List{
                                        ForEach(0..<suggestions.count) { index in
                                            if let ticker = suggestions[index]["symbol"] as? String{
                                                NavigationLink(destination: StockView(sym: "\(ticker)")) {
                                                    VStack(alignment: .leading){
                                                        Text("\(suggestions[index]["symbol"] ?? "" )").fontWeight(.bold).font(.system(size: 20))
                                                        Text("\(suggestions[index]["description"] ?? "")").foregroundColor(.gray)
                                                    }
                                                }
                                            }
                                        }
                                    }.listStyle(PlainListStyle())
                                        .background(Color.white)
                                        .cornerRadius(8)
                                        .frame(width: geometry.size.width, height: geometry.size.height*7/12)
                                }
                            }
                            Spacer()
                        }
                    }.padding(.horizontal, 20)
            }.navigationBarTitle("Stocks")
                .navigationBarHidden(true)
                .background(isSuggestionLoading ? Color.white:Color.gray.opacity(0.1))
                .onAppear {fresh()}
        }
    }
    func currentDateFormatted() -> String {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "MMMM dd, yyyy"
            return dateFormatter.string(from: Date())
        }
    
    func fresh() {
        let dispatchGroup = DispatchGroup()
        dispatchGroup.enter()
        isLoading = true
        portfolioData = []
        favoritesData = []
        AF.request("http://localhost:8000/queryUserData").responseJSON { response in
            switch response.result {
            case .success(let data):
                guard let json = try? JSON(data) else{print("Failed in trasfer user data to json")}
                do{
                    userData = try JSONDecoder().decode(UserData.self, from: json.rawData())}
                catch{
                        print("Decode Error")
                    }
                if let keys = userData?.portfolio.keys{
                    for key in keys {
                        dispatchGroup.enter()
                        fetchStock(sym: key) { stockData in
                            if let stockData = stockData {
                                portfolioData.append(stockData)
                            } else {
                                print("fetch error in \(key)")
                            }
                            dispatchGroup.leave()
                        }
                    }
                }
                if let userData = userData {
                    for item in userData.watchlist {
                        dispatchGroup.enter()
                        fetchStock(sym: item) { stockData in
                            if let stockData = stockData {
                                favoritesData.append(stockData)
                            } else {
                                print("fetch error in \(item)")
                            }
                            dispatchGroup.leave()
                        }
                    }
                }
                    
            case .failure(let error):
                print("Error: \(error.localizedDescription)")
            }
                dispatchGroup.leave()
            }
        dispatchGroup.notify(queue: .main) {
                isLoading = false
            }
        }
    func loadSuggestion(){
        isSuggestionLoading = true
        let dispatchGroup = DispatchGroup()
            dispatchGroup.enter()
            AF.request("http://localhost:8000/autoComplete?q=\(searchText)&tokenF=\(tokenF)").responseJSON { response in
                switch response.result {
                case .success(let data):
                    if let suggestionResponse = data as? [String: Any] {
                        if let suggestion = suggestionResponse["result"] as? [[String: Any]]{
                            suggestions = Array(suggestion.prefix(6))
                        }
                    }
                case .failure(let error):
                    print("Error: \(error.localizedDescription)")
                }
                dispatchGroup.leave()
            }
        dispatchGroup.notify(queue: .main) {
            isSuggestionLoading = false
        }
    }
    func fetchStock(sym:String,completion: @escaping ([String: Any]?) -> Void){
        AF.request("http://localhost:8000/queryStock?symbol=\(sym)&tokenF=\(tokenF)").responseJSON { response in
            switch response.result {
            case .success(let data):
                if let singleStockResponse = data as? [String: Any] {
                    completion(singleStockResponse)
            }else {
                completion(nil)
            }
            case .failure(let error):
                print("Error: \(error.localizedDescription)")
            }
        }
    }
    func calculateWorth() -> Double {
        let cash = userData?.money as? Double ?? 0
        var worth = cash
        
        for index in 0..<portfolioData.count {
            if let ticker = portfolioData[index]["ticker"] as? String{
                let price = portfolioData[index]["c"] as? Double ?? 0
                let shares = userData?.portfolio[ticker]?.count ?? 0
                worth += Double(shares) * price
            }
        }
        
        return worth
    }
    func favoriteMove(from source: IndexSet, to destination: Int) {
        favoritesData.move(fromOffsets: source, toOffset: destination)
    }
    func portfolioMove(from source: IndexSet, to destination: Int) {
        portfolioData.move(fromOffsets: source, toOffset: destination)
    }
    func delete(at offsets: IndexSet) {
        let group = DispatchGroup()
            for index in offsets {
                let favorite = favoritesData[index]
                group.enter() // 进入 DispatchGroup
                
                DispatchQueue.global().async {
                    handleWatchlist(sym: "\(favorite["ticker"] ?? "")")
                    group.leave()
                }
            }
            group.notify(queue: .main) {
                favoritesData.remove(atOffsets: offsets)
            }
    }
    func handleWatchlist(sym: String){
        AF.request("http://localhost:8000/handleWatchList?symbol=\(sym)").responseJSON { response in
            switch response.result {
            case .success(let data):
                guard let json = try? JSON(data) else{print("Failed in trasfer user data to json")}
                do{
                    userData = try JSONDecoder().decode(UserData.self, from: json.rawData())}
                catch{
                    print("JSON Decode Error")
                }
            case .failure(let error):
                print("Error: \(error.localizedDescription)")
            }
        }
    }

}

#if DEBUG
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
#endif

extension UIApplication {
    func endEditing() {
        sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}
