//
//  StockView.swift
//  IOS
//
//  Created by 刘茗 on 2024/4/14.
//

import SwiftUI
import Alamofire
import SwiftyJSON
import Highcharts
import UIKit
import WebKit

struct HighchartsWebView: UIViewRepresentable {
    let htmlString: String
    
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        uiView.loadHTMLString(htmlString, baseURL: nil)
    }
}
struct Toast<Presenting>: View where Presenting: View {

    /// The binding that decides the appropriate drawing in the body.
    @Binding var isShowing: Bool
    /// The view that will be "presenting" this toast
    let presenting: () -> Presenting
    /// The text to show
    let text: Text

    var body: some View {

        GeometryReader { geometry in

            ZStack(alignment: .bottom) {

                self.presenting()
                    .blur(radius: 0)

                VStack {
                    self.text
                }
                .frame(width: geometry.size.width * 3 / 5,
                       height: geometry.size.height / 8)
                .background(Color.gray)
                .foregroundColor(Color.primary)
                .cornerRadius(20)
                .transition(.slide)
                .opacity(self.isShowing ? 1 : 0)
            }
        }
    }
}

extension View {

    func toast(isShowing: Binding<Bool>, text: Text) -> some View {
        Toast(isShowing: isShowing,
              presenting: { self },
              text: text)
    }

}

struct NewsSheetView: View {
    @Environment(\.dismiss) var dismiss
    let selectedNews: [String: Any]

    var body: some View {
        VStack(alignment: .leading){
            Button(action: {
                withAnimation {
                    dismiss()
                }
                UIApplication.shared.endEditing()
            }) {
                HStack{
                    Spacer()
                    Image(systemName: "multiply")
                        .foregroundColor(.gray)
                }
            }.padding(.top,20)
            Divider().hidden()
            Divider().hidden()
            Text("\(selectedNews["source"] ?? "")").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/).font(.title)
            Text("\(formatDateFromTimestamp(timestamp: selectedNews["datetime"] as? TimeInterval ?? 0))").foregroundColor(.gray).fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
            Divider()
            Text("\(selectedNews["headline"] ?? "")").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/).font(.headline)
            Divider().hidden()
            Text("\(selectedNews["summary"] ?? "")")
            HStack{
                Text("For more details click").foregroundColor(.gray)
                Text("here").onTapGesture {
                    if let url = URL(string: "\(selectedNews["url"] ?? "")") {
                        UIApplication.shared.open(url)
                    }
                }.foregroundColor(Color.blue)
            }
            HStack{
                let url = selectedNews["url"] as? String ?? ""
                let headline = selectedNews["headline"] as? String ?? ""
                Button(action: {
                    withAnimation {
                        if let url = URL(string: "https://twitter.com/intent/tweet?url=\(url.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&text=\(headline.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")") {
                            UIApplication.shared.open(url)
                        }
                    }
                    UIApplication.shared.endEditing()
                }) {
                    Image("twitter")
                            .resizable()
                            .frame(width: 30, height: 30)
                }
                Button(action: {
                    withAnimation {
                        if let url = URL(string: "https://www.facebook.com/sharer/sharer.php?u=\(url.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")") {
                            UIApplication.shared.open(url)
                        }
                    }
                    UIApplication.shared.endEditing()
                }) {
                    Image("facebook")
                            .resizable()
                            .frame(width: 30, height: 30)
                }
            }
            Spacer()
        }.padding(.horizontal,20)
        
    }
    func formatDateFromTimestamp(timestamp: TimeInterval) -> String {
        let date = Date(timeIntervalSince1970: timestamp)
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMMM dd, yyyy"
        
        return dateFormatter.string(from: date)
    }
}

struct DealSheetView: View {
    @Environment(\.dismiss) var dismiss
    @Binding var stockData: [String: Any]
    @Binding var userData: UserData?

    @State private var showToast: Bool = false
    @State private var toastText: String = ""
    @State private var inputNumber: String = ""
    @State private var totalPrice: Double = 0
    @State private var dealFinished: Bool = false
    @State private var message: String = ""
    
    var body: some View {
        if dealFinished{
            ZStack{
                HStack{
                    Spacer()
                    VStack{
                        Spacer()
                        Text("Congradulations!").font(.largeTitle).foregroundColor(.white).fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                        Divider().hidden()
                        Text("\(message)").foregroundColor(.white)
                        Spacer()
                        Button(action: {
                            withAnimation {
                                dismiss()
                            }
                            UIApplication.shared.endEditing()
                        }) {
                            HStack{
                                Spacer()
                                Text("Done").fontWeight(.bold)
                                    .foregroundColor(.green)
                                    .padding(.vertical,10)
                                Spacer()
                            }.background(Color.white)
                                .cornerRadius(20)
                        }
                    }
                    Spacer()
                }
            }.background(Color.green)
        }else{
            VStack(alignment: .leading){
                Button(action: {
                    withAnimation {
                        dismiss()
                    }
                    UIApplication.shared.endEditing()
                }) {
                    HStack{
                        Spacer()
                        Image(systemName: "multiply")
                            .foregroundColor(.gray)
                    }.padding(.top,20)
                }
                Divider().hidden()
                Divider().hidden()
                HStack{
                    Spacer()
                    Text("Trade \(stockData["name"] ?? "") shares").fontWeight(.bold).foregroundColor(Color.black)
                    Spacer()
                }
                
                Spacer()
                HStack(alignment: .firstTextBaseline){
                    TextField("0", text: $inputNumber).font(.system(size: 80)).onChange(of: inputNumber ) { newValue in
                        if let newValue = Double(newValue){
                            let price = stockData["c"] as? Double ?? 0
                            totalPrice = price * newValue
                        }else{
                            totalPrice = 0
                        }
                    }
                    Text("Share").font(.largeTitle)
                }
                HStack{
                    let price = stockData["c"] as? Double ?? 0
                    Spacer()
                    Text("x $\(String(format: "%.2f",price))/share = \(String(format: "%.2f",totalPrice))$")
                    
                }
                Spacer()
                HStack{
                    Spacer()
                    Text("$\(String(format: "%.2f",(userData?.money ?? 0))) available to buy \(stockData["ticker"] ?? "")").foregroundColor(.gray)
                    Spacer()
                }
                HStack{
                    Spacer()
                    Button(action: {
                        withAnimation {
                            handleDeal(dealType: "buy")
                        }
                        UIApplication.shared.endEditing()
                    }) {
                        HStack{
                            Spacer()
                            Text("Buy").fontWeight(.bold)
                                .foregroundColor(.white)
                                .padding(.vertical,10)
                            Spacer()
                        }.background(Color.green)
                            .cornerRadius(20)
                    }
                    Button(action: {
                        withAnimation {
                            handleDeal(dealType: "sell")
                        }
                        UIApplication.shared.endEditing()
                    }) {
                        HStack{
                            Spacer()
                            Text("Sell").fontWeight(.bold)
                                .foregroundColor(.white)
                                .padding(.vertical,10)
                            Spacer()
                        }.background(Color.green)
                            .cornerRadius(20)
                    }
                    Spacer()
                }
                
            }.padding(.horizontal, 20)
                .toast(isShowing: $showToast, text: {
                    return Text("\(toastText)")
                }())
        }
        
    }
    
    func handleDeal(dealType: String){
        let userMoney = userData?.money ?? 0
        let price = stockData["c"] as? Double ?? 0
        let ticker = stockData["ticker"] as? String ?? ""
        let history = userData?.portfolio["\(ticker)"] as? [Double] ?? []
        if !isPositiveInteger(inputNumber){
            toastText = "Please enter a valid amount"
            showToast.toggle()
        }else if dealType == "buy"{
            if let num = Double(inputNumber){
                if price * num > userMoney{
                    toastText = "Not enough to buy"
                    showToast.toggle()
                }else{
                    AF.request("http://localhost:8000/makeDeal?symbol=\(stockData["ticker"] ?? "")&num=\(inputNumber)&price=\(price)").responseJSON { response in
                        switch response.result {
                        case .success(let data):
                            dealFinished = true
                            message = "You have successfully bought \(inputNumber) shares of \(stockData["ticker"] ?? "")"
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

        }else if dealType == "sell"{
            if let num = Int(inputNumber){
                if num > history.count{
                    toastText = "Not enough to sell"
                    showToast.toggle()
                }else{
                    AF.request("http://localhost:8000/makeDeal?symbol=\(stockData["ticker"] ?? "")&num=-\(inputNumber)&price=\(price)").responseJSON { response in
                        switch response.result {
                        case .success(let data):
                            dealFinished = true
                            message = "You have successfully sold \(inputNumber) shares of \(stockData["ticker"] ?? "")"
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
        }
        if showToast {
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    showToast = false
                    toastText = ""
                }
        }
    }
    func isPositiveInteger(_ str: String) -> Bool {
        let pattern = "^[1-9]\\d*$"
        do {
            let regex = try NSRegularExpression(pattern: pattern)
            let matches = regex.matches(in: str, range: NSRange(str.startIndex..., in: str))
            return !matches.isEmpty && matches[0].range == NSRange(location: 0, length: str.count)
        } catch {
            return false
        }
    }
    
}

struct StockView: View {
    let sym: String
    let tokenF = "cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0"
    let tokenP = "fSelM6w8GpMT23I9Cf6pwdkQNtl6OiJG"
    @State private var stockData: [String: Any] = [:]
    @State private var userData: UserData?
    @State private var isLoading = true
    @State private var selectedSpan = "Hourly"
    @State private var showNewsDetail = false
    @State private var showToast: Bool = false
    @State private var toastText: String = ""
    @State private var showDeal = false
    init(sym: String) {
        self.sym = sym
        
    }
    
    var body: some View {
        NavigationView {
            if isLoading{
                VStack{
                    Image(systemName: "rays")
                    Text("Fetching Data...")
                }
            }else{
                ScrollView(.vertical, showsIndicators: true) {
                    VStack{
                        HStack{
                            Text("\(stockData["name"] ?? "")")
                                .foregroundColor(Color.gray)
                            Spacer()
                        }
                        Divider().hidden()
                        HStack{
                            if let history = userData?.portfolio["\(sym)"] as? [Double]{
                                if let currentPrice = stockData["c"] as? Double{
                                    let total = history.reduce(0, +)
                                    let marketVal = Double(history.count) * currentPrice
                                    
                                    let change = marketVal - total
                                    let changePercentage = (marketVal - total)/total
                                    let color = change > 0 ? Color.green : (change < 0 ? Color.red :  Color.gray)
                                    let arrowSymbolName = change > 0 ? "arrow.up.right" : (change < 0 ? "arrow.down.right" :  "minus")
                                    let arrowSymbol = Image(systemName: arrowSymbolName)
                                        .foregroundColor(color)
                                    Text("$\(stockData["c"] ?? "")")
                                        .font(.title)
                                        .fontWeight(.bold)
                                    arrowSymbol
                                    Text("$\(abs(change))"+"(\(String(format: "%.2f",abs(changePercentage)))%)")
                                        .foregroundColor(color)
                                    
                                    Spacer()
                                }
                            }
                        }
                        if selectedSpan == "Hourly"{
                            HighchartsWebView(htmlString: generateHourlyStockHTML()).frame(height: 160)
                        }else{
                            HighchartsWebView(htmlString: generateHistoricalStockHTML()).frame(height: 160)
                        }
                        HStack{
                            Spacer()
                            Button(action: {
                                withAnimation {
                                    selectedSpan = "Hourly"
                                }
                                UIApplication.shared.endEditing()
                            }) {
                                VStack{
                                    Image(systemName: "chart.xyaxis.line")
                                        .foregroundColor(.gray)
                                    Text("Hourly").foregroundColor(.gray)
                                }
                            }
                            Spacer()
                            Button(action: {
                                withAnimation {
                                    selectedSpan = "Historical"
                                }
                                UIApplication.shared.endEditing()
                            }) {
                                VStack{
                                    Image(systemName: "clock.fill")
                                        .foregroundColor(.gray)
                                    Text("Historical").foregroundColor(.gray)
                                }
                            }
                            Spacer()
                        }
                        Divider().hidden()
                        VStack(alignment: .leading){
                            HStack{
                                Text("Portfolio").font(.title)
                                Spacer()
                            }
                            HStack{
                                VStack(alignment: .leading){
                                    let ticker = stockData["ticker"] ?? ""
                                    if let history = userData?.portfolio["\(ticker)"] as? [Double]{
                                        if let currentPrice = stockData["c"] as? Double{
                                            let total = history.reduce(0, +)
                                            let marketVal = Double(history.count) * currentPrice
                                            let change = marketVal - total
                                            let color = change > 0 ? Color.green : (change < 0 ? Color.red :  Color.black)
                                            HStack{
                                                Text("Shares Owned:  ").fontWeight(.bold)
                                                Text("\(history.count)")
                                            }
                                            Divider().hidden()
                                            HStack{
                                                Text("Avg. Cost/Share:  ").fontWeight(.bold)
                                                Text("$\(String(format: "%.2f",(total/Double(history.count))))")
                                            }
                                            Divider().hidden()
                                            HStack{
                                                Text("Total Cost:  ").fontWeight(.bold)
                                                Text("$\(String(format: "%.2f",total))")
                                            }
                                            Divider().hidden()
                                            HStack{
                                                Text("Change:  ").fontWeight(.bold).foregroundColor(color)
                                                Text("$\(String(format: "%.2f",(marketVal - total)))").foregroundColor(color)
                                            }
                                            Divider().hidden()
                                            HStack{
                                                Text("Market Value:  ").fontWeight(.bold).foregroundColor(color)
                                                Text("$\(String(format: "%.2f",marketVal))").foregroundColor(color)
                                            }
                                        }
                                    }else{
                                        Text("You have 0 shares of \(ticker).")
                                        Divider().hidden()
                                        Text("Start trading!")
                                    }
                                }
                                Spacer()
                                Button(action: {
                                    withAnimation {
                                        showDeal.toggle()
                                    }
                                    UIApplication.shared.endEditing()
                                }) {
                                    Text("Trade")
                                        .foregroundColor(.white)
                                        .fontWeight(.bold)
                                        .padding(.horizontal,30)
                                        .padding(.vertical,10)
                                }.background(Color.green)
                                    .cornerRadius(20)
                                    .sheet(isPresented: $showDeal) {
                                        DealSheetView(stockData: $stockData, userData: $userData)
                                    }
                            }
                        }
                        Divider().hidden()
                        VStack(alignment: .leading){
                            HStack{
                                Text("Stats").font(.title)
                                Spacer()
                            }
                            Divider().hidden()
                            HStack{
                                VStack(alignment: .leading){
                                    HStack{
                                        Text("High Price: ").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                        Text("$\(stockData["c"] ?? "")")
                                    }
                                    Divider().hidden()
                                    HStack{
                                        Text("Low Price: ").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                        Text("$\(stockData["l"] ?? "")")
                                    }
                                }
                                VStack(alignment: .leading){
                                    HStack{
                                        Text("Open Price: ").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                        Text("$\(stockData["o"] ?? "")")
                                    }
                                    Divider().hidden()
                                    HStack{
                                        Text("Prev. Close: ").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                        Text("$\(stockData["pc"] ?? "")")
                                    }
                                }
                            }
                        }
                        Divider().hidden()
                        VStack(alignment: .leading){
                            HStack{
                                Text("About").font(.title)
                                Spacer()
                            }
                            Divider().hidden()
                            HStack{
                                VStack(alignment: .leading){
                                    Text("IPO Start Date:").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                    Text("Industry:").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                    Text("Webpage:").fontWeight(.bold)
                                    Text("Company Peers:").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                    Spacer()
                                }
                                VStack(alignment: .leading){
                                    Text("\(stockData["ipo"] ?? "")")
                                    Text("\(stockData["finnhubIndustry"] ?? "")")
                                    Text("\(stockData["weburl"] ?? "")").onTapGesture {
                                        if let url = URL(string: "\(stockData["weburl"] ?? "")") {
                                            UIApplication.shared.open(url)
                                        }
                                    }.foregroundColor(Color.blue)
                                    ScrollView(.horizontal, showsIndicators: true) {
                                        HStack{
                                            if let peers = stockData["peers"] as? [String]{
                                                ForEach(0..<peers.count) { index in
                                                    let item = peers[index]
                                                    NavigationLink(destination: StockView(sym: "\(peers[index])")){
                                                        Text("\(peers[index]),")
                                                            .foregroundColor(.blue)
                                                            .underline()
                                                    }
                                                }
                                            }
                                        }
                                    }.frame(height: 3)
                                    Spacer()
                                }
                            }
                        }
                        Divider().hidden()
                        VStack(alignment: .leading){
                            let insightValues = calculateInsight()
                            
                            let MSPRTotal = insightValues[0]
                            let MSPRPositive = insightValues[1]
                            let MSPRNegative = insightValues[2]
                            let ChangeTotal = String(format: "%.2f", insightValues[3])
                            let ChangePositive = String(format: "%.2f", insightValues[4])
                            let ChangeNegative = String(format: "%.2f", insightValues[5])
                            HStack{
                                Text("Insights").font(.title)
                                Spacer()
                            }
                            Divider().hidden()
                            HStack{
                                Spacer()
                                Text("Insider Sentiments").font(.title)
                                Spacer()
                            }
                            Divider().hidden()
                            HStack{
                                VStack(alignment: .leading){
                                    Text("\(stockData["name"] ?? "")").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                    Divider()
                                    Text("Total").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                    Divider()
                                    Text("Positive").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                    Divider()
                                    Text("Negative").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                    Divider()
                                }
                                Spacer()
                                VStack(alignment: .leading){
                                    Text("MSPR").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                    Divider()
                                    Text("\(String(format: "%.2f",MSPRTotal))")
                                    Divider()
                                    Text("\(String(format: "%.2f",MSPRPositive))")
                                    Divider()
                                    Text("\(String(format: "%.2f",MSPRNegative))")
                                    Divider()
                                }
                                Spacer()
                                VStack(alignment: .leading){
                                    Text("Change").fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                    Divider()
                                    Text("\(ChangeTotal)")
                                    Divider()
                                    Text("\(ChangePositive)")
                                    Divider()
                                    Text("\(ChangeNegative)")
                                    Divider()
                                }
                            }
                        }
                        Divider().hidden()
                        HighchartsWebView(htmlString: generateRecommendationStockHTML()).frame(height: 160)
                        Divider().hidden()
                        HighchartsWebView(htmlString: generateEPSChartHTML()).frame(height: 160)
                        VStack(alignment: .leading){
                            HStack{
                                Text("News").font(.title)
                                Spacer()
                            }
                            if let latestNews = stockData["latestNews"] as? [[String:Any]]{
                                VStack{
                                    ForEach(0..<latestNews.count) { index in
                                        if let news = latestNews[index] as? [String: Any]{
                                            let datetime = news["datetime"] as? TimeInterval ?? 0
                                            if index == 0{
                                                Button(action: {
                                                    withAnimation {
                                                        showNewsDetail.toggle()
                                                    }
                                                    UIApplication.shared.endEditing()
                                                }) {
                                                    VStack(alignment: .leading){
                                                        AsyncImage(url: URL(string: "\(news["image"] ?? "")")){ phase in
                                                            switch phase {
                                                            case .success(let image):
                                                                image
                                                                    .resizable()
                                                                    .scaledToFit()
                                                            default:
                                                                Color.clear
                                                            }
                                                        }
                                                        Text("\(news["source"] ?? "") \(formatTimeInterval(timestamp:datetime))").foregroundColor(Color.gray)
                                                            .font(.system(size: 12))
                                                        Text("\(news["headline"] ?? "")").foregroundColor(Color.black)
                                                            .multilineTextAlignment(.leading)
                                                            .fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                                    }
                                                }.sheet(isPresented: $showNewsDetail) {
                                                    NewsSheetView(selectedNews: news)
                                                }
                                                Divider()
                                            }
                                            else{
                                                Button(action: {
                                                    withAnimation {
                                                        showNewsDetail.toggle()
                                                    }
                                                    UIApplication.shared.endEditing()
                                                }) {
                                                    HStack{
                                                        VStack(alignment: .leading){
                                                            Text("\(news["source"] ?? "") \(formatTimeInterval(timestamp:datetime))")
                                                                .foregroundColor(Color.gray)
                                                                .font(.system(size: 12))
                                                            Text("\(news["headline"] ?? "")").foregroundColor(Color.black)
                                                                .multilineTextAlignment(.leading)
                                                                .fontWeight(/*@START_MENU_TOKEN@*/.bold/*@END_MENU_TOKEN@*/)
                                                        }
                                                        Spacer()
                                                        AsyncImage(url: URL(string: "\(news["image"] ?? "")")){ phase in
                                                            switch phase {
                                                            case .success(let image):
                                                                image
                                                                    .resizable()
                                                                    .scaledToFit()
                                                            default:
                                                                Color.clear
                                                            }
                                                        }
                                                    }
                                                }.sheet(isPresented: $showNewsDetail) {
                                                    NewsSheetView(selectedNews: news)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }.padding(.horizontal, 20)
                }
                
            }
        }.onAppear {fresh()}
            .navigationBarTitle("\(sym)")
            .navigationBarItems(trailing:
                        Button(action: {
                            handleWatchlist()
                            
                        }) {
                            if let watchlist = userData?.watchlist{
                                let iconName = watchlist.contains("\(sym)") ? "plus.circle.fill" : "plus.circle"
                                Image(systemName: "\(iconName)")
                            }
                        }
            ).toast(isShowing: $showToast, text: {
                return Text("\(toastText)")
            }())
    }
    func fresh(){
        let dispatchGroup = DispatchGroup()
            dispatchGroup.enter()
        AF.request("http://localhost:8000/queryUserData").responseJSON { response in
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
            dispatchGroup.leave()
        }
        dispatchGroup.enter()
        //        AF.request("http://localhost:8000/search?symbol=\(sym)&tokenF=\(tokenF)&tokenP=\(tokenP)").responseJSON { response in
        //            switch response.result {
        //            case .success(let data):
        //                if let stockResponse = data as? [String: Any] {
        //                    stockData = stockResponse
        //                }
        //            case .failure(let error):
        //                print("Error: \(error.localizedDescription)")
        //            }
        //            dispatchGroup.leave()
        //        }
        if let fileURL = Bundle.main.url(forResource: "data", withExtension: "json") {
            do {
                let data = try Data(contentsOf: fileURL)
                if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    stockData = json
                } else {
                    print("JSON Decode Error")
                }
                dispatchGroup.leave()
            } catch {
                print("JSON Read Error：\(error.localizedDescription)")
            }
        } else {
            print("JSON File Not Found")
        }
            
        dispatchGroup.notify(queue: .main) {
            isLoading = false
        }
    }
    func calculateInsight() -> [Double]{
        var MSPRTotal = 0.0, MSPRPositive = 0.0, MSPRNegative = 0.0
        var ChangeTotal = 0.0, ChangePositive = 0.0, ChangeNegative = 0.0
        
        if let insiderSentiment = stockData["insiderSentiment"] as? [String:Any]{
            if let data = insiderSentiment["data"] as? [[String:Any]]{
                for i in 0..<data.count {
                    let mspr = data[i]["mspr"] as? Double ?? 0
                    let change = data[i]["change"] as? Double ?? 0
                    
                    if mspr > 0 {
                        MSPRPositive += mspr
                    } else {
                        MSPRNegative += mspr
                    }
                    
                    if change > 0 {
                        ChangePositive += change
                    } else {
                        ChangeNegative += change
                    }
                    
                    MSPRTotal += mspr
                    ChangeTotal += change
                }
            }
        }
        return [MSPRTotal,MSPRPositive,MSPRNegative,ChangeTotal,ChangePositive,ChangeNegative]
    }
    func generateHourlyStockHTML() -> String {
        let hourlyData = stockData["hourlyData"] as? [[Any]] ?? []
            var dataString = "["

            for data in hourlyData {
                let timestamp = data[0] as? Double ?? 0
                let value = data[1] as? Double ?? 0
                dataString += "[\(timestamp), \(value)],"
            }

            // Remove the trailing comma
            dataString.removeLast()
            dataString += "]"
            return """
    <html>
    <head>
        <script src="https://code.highcharts.com/highcharts.js"></script>
        <script src="https://code.highcharts.com/modules/stock.js"></script>
        <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
    </head>
    <body>
        <div id="chart-container" style="width: 100%; height: 400px;"></div>
        <script>
            document.addEventListener('DOMContentLoaded', function () {
                Highcharts.stockChart('chart-container', {
                    navigator: {
                        enabled: false
                    },
                    rangeSelector: {
                        buttons: [],
                        inputEnabled: false
                    },
                    title: {
                        text: '\(stockData["ticker"] ?? "") Hourly Price Variation'
                    },
                    series: [{
                        name: '\(stockData["ticker"] ?? "")',
                        data: \(hourlyData),
                        color: 'green'
                    }]
                });
            });
        </script>
    </body>
    </html>
    """
        }
    func generateHistoricalStockHTML() -> String {
        let groupingUnits: [[Any]] = [
            ["week", [1]],
            ["month", [1, 2, 3, 4, 6]]
        ]
        var ohlcDataString = "["
        var volumeDataString = "["
        
        for data in stockData["chartData"] as? [[Any]] ?? [] {
            let date = data[0] as? Double ?? 0
            let open = data[1] as? Double ?? 0
            let high = data[2] as? Double ?? 0
            let low = data[3] as? Double ?? 0
            let close = data[4] as? Double ?? 0
            let volume = data[5] as? Double ?? 0
            
            ohlcDataString += "[\(date), \(open), \(high), \(low), \(close)],"
            volumeDataString += "[\(date), \(volume)],"
        }
        
        // Remove the trailing comma
        ohlcDataString.removeLast()
        volumeDataString.removeLast()
        
        ohlcDataString += "]"
        volumeDataString += "]"
        
        return """
        <html>
        <head>
            <script src="https://code.highcharts.com/highcharts.js"></script>
            <script src="https://code.highcharts.com/modules/stock.js"></script>
            <script src="https://code.highcharts.com/modules/data.js"></script>
            <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
            <script src="https://code.highcharts.com/stock/indicators/indicators.js"></script>
            <script src="https://code.highcharts.com/stock/indicators/volume-by-price.js"></script>
        </head>
        <body>
            <div id="chart-container" style="width: 100%; height: 400px;"></div>
            <script>
                document.addEventListener('DOMContentLoaded', function () {
                    Highcharts.stockChart('chart-container', {
                        rangeSelector: {
                            selected: 2
                        },
                        title: {
                            text: '\(stockData["ticker"] ?? "") Historical'
                        },
                        subtitle: {
                            text: 'With SMA and Volume by Price technical indicators'
                        },
                        yAxis: [{
                            startOnTick: false,
                            endOnTick: false,
                            labels: {
                                align: 'right',
                                x: -3
                            },
                            title: {
                                text: 'OHLC'
                            },
                            height: '60%',
                            lineWidth: 2,
                            resize: {
                                enabled: true
                            }
                        }, {
                            labels: {
                                align: 'right',
                                x: -3
                            },
                            title: {
                                text: 'Volume'
                            },
                            top: '65%',
                            height: '35%',
                            offset: 0,
                            lineWidth: 2
                        }],
                        tooltip: {
                            split: true
                        },
                        plotOptions: {
                            series: {
                                dataGrouping: {
                                    units: \(groupingUnits)
                                }
                            }
                        },
                        series: [{
                                    type: 'candlestick',
                                    name: '\(stockData["ticker"] ?? "")',
                                    id: '\(stockData["ticker"] ?? "")',
                                    zIndex: 2,
                                    data: \(ohlcDataString)
                                }, {
                                    type: 'column',
                                    name: 'Volume',
                                    id: 'volume',
                                    data: \(volumeDataString),
                                    yAxis: 1
                                }, {
                                    type: 'vbp',
                                    linkedTo: '\(stockData["ticker"] ?? "")',
                                    params: {
                                        volumeSeriesID: 'volume'
                                    },
                                    dataLabels: {
                                        enabled: false
                                    },
                                    zoneLines: {
                                        enabled: false
                                    }
                                }, {
                                    type: 'sma',
                                    linkedTo: '\(stockData["ticker"] ?? "")',
                                    zIndex: 1,
                                    marker: {
                                        enabled: false
                                    }
                                }]
                    });
                });
            </script>
        </body>
        </html>
        """
    }
    
    func generateRecommendationStockHTML() -> String {
        guard let recommendationData = stockData["recommendationData"] as? [[String:Any]] else {
            return "Error: recommendation data is missing or has incorrect format"
        }
        return """
            <html>
            <head>
                <script src="https://code.highcharts.com/highcharts.js"></script>
                <script src="https://code.highcharts.com/modules/stock.js"></script>
                <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
            </head>
            <body>
                <div id="chart-container" style="width: 100%; height: 400px;"></div>
                <script>
                    document.addEventListener('DOMContentLoaded', function () {
                        Highcharts.chart('chart-container', {
                            chart: {
                                type: 'column',
                            },
                            navigator: {
                                enabled: false // 设置为false以隐藏导航器
                            },
                            rangeSelector: {
                                buttons: [],
                                inputEnabled: false
                            },
                            title: {
                                text: 'Recommendation Trends'
                            },
                            xAxis: {
                                type: 'datetime',
                            },
                            yAxis: {
                                title: {
                                    text: '#Analysis'
                                }
                            },
                            plotOptions: {
                                column: {
                                    stacking: 'normal'
                                }
                            },
                            series: [{
                                name: 'Strong Buy',
                                color: 'green',
                                data: \((recommendationData.compactMap {
                                    let period = $0["period"] as? String ?? ""
                                    let strongBuy = $0["strongBuy"] as? Double ?? 0
                                    return [period, strongBuy]
                                    }).map { [$0[0], $0[1]] })
                            }, {
                                name: 'Buy',
                                color: '#3CB371',
                                data: \((recommendationData.compactMap {
                                    let period = $0["period"] as? String ?? ""
                                    let buy = $0["buy"] as? Double ?? 0
                                    return [period, buy]
                                    }).map { [$0[0], $0[1]] })
                            }, {
                                name: 'Hold',
                                color: '#B8860B',
                                data: \((recommendationData.compactMap {
                                    let period = $0["period"] as? String ?? ""
                                    let hold = $0["hold"] as? Double ?? 0
                                    return [period, hold]
                                    }).map { [$0[0], $0[1]] })
                            }, {
                                name: 'Sell',
                                color: '#FF6347',
                                data: \((recommendationData.compactMap {
                                    let period = $0["period"] as? String ?? ""
                                    let sell = $0["sell"] as? Double ?? 0
                                    return [period, sell]
                                    }).map { [$0[0], $0[1]] })
                            }, {
                                name: 'Strong Sell',
                                color: '#8B4513',
                                data: \((recommendationData.compactMap {
                                    let period = $0["period"] as? String ?? ""
                                    let strongSell = $0["strongSell"] as? Double ?? 0
                                    return [period, strongSell]
                                    }).map { [$0[0], $0[1]] })
                            }]
                        });
                    });
                </script>
            </body>
            </html>
            """
    }
        
    func generateEPSChartHTML() -> String {
        guard let earnings = stockData["earnings"] as? [[String:Any]] else{
            return "Error: earnings data is missing or has incorrect format"
        }
        let dates = earnings.map { $0["period"] as? String ?? "" }.map { String($0.prefix(10)) }
        let actualEPS = earnings.map { $0["actual"] as? Double ?? 0 }
        let estimateEPS = earnings.map { $0["estimate"] as? Double ?? 0 }
        return """
        <html>
        <head>
            <script src="https://code.highcharts.com/highcharts.js"></script>
            <script src="https://code.highcharts.com/modules/stock.js"></script>
            <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
        </head>
        <body>
            <div id="chart-container" style="width: 100%; height: 400px;"></div>
            <script>
                document.addEventListener('DOMContentLoaded', function () {
                    Highcharts.stockChart('chart-container', {
                        chart: {
                            type: 'line'
                        },
                        navigator: {
                            enabled: false
                        },
                        rangeSelector: {
                            buttons: [],
                            inputEnabled: false
                        },
                        title: {
                            text: 'Historical EPS Surprises'
                        },
                        xAxis: {
                            categories: \(dates),
                        },
                        yAxis: {
                            title: {
                                text: 'Quarterly EPS'
                            },
                            opposite: false
                        },
                        series: [{
                            name: 'Actual',
                            data: \(actualEPS),
                            type: 'spline'
                        }, {
                            name: 'Estimate',
                            data: \(estimateEPS),
                            type: 'spline'
                        }]
                    });
                });
            </script>
        </body>
        </html>
        """
    }
    func formatTimeInterval(timestamp: TimeInterval) -> String {
        let date = Date(timeIntervalSince1970: timestamp)
        
        let now = Date()
        
        let calendar = Calendar.current
        
        let components = calendar.dateComponents([.hour, .minute], from: date, to: now)
        
        let hours = components.hour ?? 0
        let minutes = components.minute ?? 0
        
        var formattedString = ""
        if hours > 0 {
            formattedString += "\(hours) hr"
        }
        if minutes > 0 {
            if !formattedString.isEmpty {
                formattedString += ", "
            }
            formattedString += "\(minutes) min"
        }
        
        return formattedString
    }
    func handleWatchlist(){
        AF.request("http://localhost:8000/handleWatchList?symbol=\(sym)").responseJSON { response in
            switch response.result {
            case .success(let data):
                guard let json = try? JSON(data) else{print("Failed in trasfer user data to json")}
                self.showToast.toggle()
                if let watchlist = userData?.watchlist{
                    toastText = !watchlist.contains("\(sym)") ? "Adding \(sym) to Favorites" : "Removinging \(sym) from Favorites"
                }
                if self.showToast {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            self.showToast = false
                            toastText = ""
                        }
                }
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

#Preview {
    StockView(sym: "TSLA")
}


