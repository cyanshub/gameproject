// 定義遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}


// 運算花色與數字: 儲存花色圖片
const Symbols = [
'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]



const view ={
  // 宣告函式: 從 getCardElement(index) 分離出 getCardContent(index), 負責顯示花色及數字
  getCardContent(index){
    const number = this.transformNumber((index % 13) + 1) // 令卡牌的數字為 index/13 的餘數 + 1
    const symbol = Symbols[Math.floor(index / 13)] // 令卡牌的花色為 index/13 取整數決定

    return `      
        <p>${number}</p>
        <img src=${symbol} alt="黑桃花色">
        <p>${number}</p>    
    `
  }, 
  
  
  // 宣告函式: 將函式當作參數傳入物件
  getCardElement: function getCardElement( index ){
  return `<div class="card back" data-index=${index}></div>` 
  // 利用 dataset 綁定 index, 鎖住卡牌
  },


  // 宣告函式: 處理數字轉換文字的問題
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  // 當物件屬性名稱與函式名稱相同時, 可以省略成函式名稱
  displayCards( indexes ) {
    const rootElement = document.querySelector('#cards')

    // rootElement.innerHTML = this.getCardElement(51)
    
    // rootElement.innerHTML = Array.from(Array(52).keys()) 
    // .map( index => this.getCardElement(index) )
    // .join('') // 按照順序的 0 ~ 51

    // rootElement.innerHTML = utility.getRandomNumberArray(52)
    // .map( index => this.getCardElement(index)  )
    // .join('') // 隨機排序的 0 ~ 51

    // 改成直接傳入打亂過的陣列
    rootElement.innerHTML = indexes
    .map(index => this.getCardElement(index))
    .join('') // 隨機排序的 0 ~ 51



  },

  // 設計觸發函式: 點擊卡牌時可以翻牌
  // flipCard(card)
  // flipCards(1, 2, 3, 4, 5)
  // cards = [1, 2, 3, 4, 5]
  flipCards(... cards){
    cards.map( card => {
      console.log(card.dataset.index)

      // 如果是背面, 回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back') // 點擊移除背面元素
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }

      // 如果是正面, 回傳背面
      card.classList.add('back')
      card.innerHTML = null // 清空花色及數字
    })
  },

  // 設計函式: 顯示配對成功樣式
  pairCards(... cards){
    cards.map( card => {
      card.classList.add('paired') // 連結到 CSS 樣式
    })
  },


  // 設計函式: 動態更新分數
  renderScore(score){
    // 使用textContent, 可忽略元素標籤, 僅寫入字串
    document.querySelector('.score').textContent = `Score: ${score}`
  },


  // 設計函式: 動態更新嘗試次數
  renderTriedTimes(times){
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },



  // 設計函式觸發動畫特效
  appendWongAnimation(...cards){
    cards.map( card => {
      card.classList.add('wrong')

      // 設置監聽事件 "animationend"
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), {once:true})
    })
  },


  // 設計函式: 當遊戲結束時顯示遊戲結束畫面
  showGameFinished(){
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTimes} times</p>
    `

    const header = document.querySelector('#header')
    header.before(div)

  }

}




const utility = {
  // 宣告函式: 產生指定長度的隨機陣列
  getRandomNumberArray(count){
    // count = 5 => [2, 3, 4, 1, 0]
    const number = Array.from(Array(count).keys() )  // 先建立一個規則排許的陣列

    for(let index = number.length-1; index > 0 ; index--){
      // 決定 index 與隨機index互換: 使用解構賦值
      let randomIndex = Math.floor(Math.random() * (index + 1) )
      // 解構賦值
      ;[number[index], number[randomIndex] ] = [number[randomIndex], number[index]]
    }

    console.log(number) // 測試
    return number
  }
}


// 控制流程的模組
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  // 啟動遊戲, 初始化資料
  generateCards(){
    view.displayCards( utility.getRandomNumberArray(52) )    
  },


  // 依照不同的遊戲狀態分派動作
  dispatchCardAction(card){
    // 檢查: 僅翻開覆蓋的卡片, 若點擊已翻開的卡片則無效
    if( !card.classList.contains('back') ){
      return
    }

    switch ( this.currentState ){
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card) // 一次翻一張
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
    

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card) // 一次翻一張
        model.revealedCards.push(card)
        
        // 判斷配對是否成功
        console.log( model.isRevealedCardsMatched()) 


        if (model.isRevealedCardsMatched() ){
          // 配對正確: 擴充 view 模組, 顯示正確樣式
          this.currentState = GAME_STATE.CardsMatched // 轉換狀態
          view.renderScore(model.score+=10) // 配對正確則加分


          // view.pairCard( model.revealedCards[0] )
          // view.pairCard( model.revealedCards[1] )
          view.pairCards(...model.revealedCards ) // 一次補上多個成功樣式
          model.revealedCards = [] // 清空

          // 若滿足通過條件即結束遊戲, 觸發結束畫面函式
          if (model.score === 260){
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits // 回復狀態

        } else {
          // 配對失敗: 延遲時間 1000 表示 1 秒
          this.currentState = GAME_STATE.CardsMatchFailed // 轉換狀態

          view.appendWongAnimation(...model.revealedCards)

          setTimeout(this.resetCards, 1000)
        }
        break
    }

    console.log('Current State: ', this.currentState) // 檢查
    console.log('Revealed Cards: ', model.revealedCards) // 檢查

  },


  // 宣告函式: 負責執行配對失敗卡片翻回的動作
  resetCards() {
    view.flipCards(...model.revealedCards) // 一次翻回多張卡
    model.revealedCards = [] // 清空
    controller.currentState = GAME_STATE.FirstCardAwaits // 回復狀態
  },

}



// 資料管理的模組
const model = {
  revealedCards: [],

  // 宣告函式: 比較第一張牌跟第二張牌的數字是否一樣
  isRevealedCardsMatched(){
    return this.revealedCards[0].dataset.index % 13 
    === this.revealedCards[1].dataset.index % 13
  },


  // 設定分數
  score: 0,

  // 設定嘗試次數
  triedTimes: 0,

}




// view.displayCards()
controller.generateCards()



// 產生多個事件監聽器, 選取HTML多個元素 => 產生 Node List
document.querySelectorAll('.card').forEach(card => {
  // 使用 forEach 逐一操作選到的 card, 設置點擊監聽器
  card.addEventListener('click', function(event){
    console.log(card)
    
    // 點擊卡片觸發函式 view.flipCard(card){}
    // 將 view.flipCard(card) 包裝在 dispatchCardAction(card) 
    controller.dispatchCardAction(card)

  })
})


