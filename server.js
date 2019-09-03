let http=require('http'),
    fs=require('fs'),
    bodyParser=require('body-parser'),
    express=require('express'),
    port=8003

let bookData=__dirname+'/database/book.json',
    collectData=__dirname+'/database/collect.json',
    sliders=require('./database/sliders'),
    jdb=(path)=>JSON.parse(fs.readFileSync(path,'utf-8'))

let app =express()
app.use(express.static(__dirname+'/static'))
app.use(bodyParser.json())

// 轮播接口
app.get('/api/sliders',(req,res)=>{
    res.send({
        code:0,
        data:sliders,
        msg:'ok'
    })
})

// 热门图书接口
app.get('/api/hot',(req,res)=>{
    let con=jdb(bookData),
    books=con.slice(-4)
    res.send({
        code:0,
        data:books,
        msg:'ok'
    })
})

// 所有图书列表
app.get('/api/books',(req,res)=>{
    let con=jdb(bookData)
    res.send({
        code:0,
        data:con,
        msg:'ok'
    })
})

// 删除图书
app.get('/api/removeBook',(req,res)=>{
    let {id}=req.query,
        con=jdb(bookData)
    con=con.filter(item=>+item.bookId!==+id)
    fs.writeFileSync(bookData,JSON.stringify(con),'utf-8')
    res.send({
        code:0,
        data:null,
        msg:'该书已删除'
    })
})

// 添加收藏图书接口
app.post('/api/collect',(req,res)=>{
    let data=req.body,
        con=jdb(collectData),
        conBook=jdb(bookData)
    let isExist=con.find(item=>+item.bookId==+data.bookId)
    if(isExist){
        res.send({
            code:1,
            data:null,
            msg:'已收藏过啦'
        })
        return
    }
    data.isCollected=true
    con.unshift(data)
    fs.writeFileSync(collectData,JSON.stringify(con),'utf-8')

    let index=conBook.findIndex(item=>item.bookId==data.bookId)
    data.bookId=+data.bookId
    conBook[index]=data
    fs.writeFileSync(bookData,JSON.stringify(conBook),'utf-8')
    
    
    res.send({
        code:0,
        data:null,
        msg:'收藏成功'
    })
})

// 获取收藏图书接口
app.get('/api/getCollect',(req,res)=>{
    let con=jdb(collectData)
    res.send({
        code:0,
        data:con,
        msg:'ok'
    })
})

// 收藏夹中删除指定图书接口
app.post('/api/removeCollect',(req,res)=>{
    let book=req.body,
        con=jdb(collectData),
        conBook=jdb(bookData)
    con=con.filter(item=>+item.bookId!==+book.bookId)
    fs.writeFileSync(collectData,JSON.stringify(con),'utf-8')
    book.isCollected=false
    let index = conBook.findIndex(item=>item.bookId==book.bookId)
    conBook[index]=book
    fs.writeFileSync(bookData,JSON.stringify(conBook),'utf-8')
    res.send({
        code:0,
        data:null,
        msg:'已取消收藏'
    })
})

// 添加图书
app.post('/api/add',(req,res)=>{
    let book=req.body,
        con=jdb(bookData)
    let isExist=con.find(item=>item.bookName==book.bookName)
    if(isExist){
        res.send({
            code:1,
            data:null,
            msg:`该书已存在，请重新添加`
        })
        return 
    }
    book.bookId=con[con.length-1].bookId+1
    con.push(book)
    fs.writeFileSync(bookData,JSON.stringify(con),'utf-8')
    res.send({
        code:0,
        data:null,
        msg:`《${book.bookName}》 已成功入库`
    })
})

// 修改图书接口
app.post('/api/updateBook',(req,res)=>{
    let book=req.body,
        con=jdb(bookData)
    let index=con.findIndex(item=>+item.bookId==+book.bookId)
    book.bookId=+book.bookId
    con[index]=book
    fs.writeFileSync(bookData,JSON.stringify(con),'utf-8')
    res.send({
        code:0,
        data:null,
        msg:'更新成功'
    })
})

// 获取当前图书信息接口
app.get('/api/getOneBook',(req,res)=>{
    let {id}=req.query,
        con=jdb(bookData)
    let temp=con.find(item=>+item.bookId==+id)
    res.send({
        code:0,
        data:temp,
        msg:'ok'
    })
})
app.listen(port,()=>console.log(`port is on ${port}`))