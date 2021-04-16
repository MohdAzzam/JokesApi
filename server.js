'use strict';
require('dotenv').config();
const PORT = 3000;
const express = require('express');
const pg = require('pg');
const cors = require('cors');
const methodoverride = require('method-override');
const superagent = require('superagent');
const client = new pg.Client(process.env.DB_URL);
const app = express();

app.use(express());
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method')); // to override the update and delete method
app.use(express.static(__dirname + '/public'));
/**
 * Routes
 * 
 */

app.get('/', (req, res) => {
    // res.send('Welcome to Our Website');
    let url = `https://official-joke-api.appspot.com/random_ten`;
    superagent.get(url).then(
        result => {
            // console.log(result.body);
            res.render('index', { jokes: result.body })
        }
    ).catch(err => console.log('ERROR'));
})

app.post('/fav', (req, res) => {
    console.log(req.body);
    const type = req.body.type;
    const setup = req.body.setup;
    const punchline = req.body.punchline;
    console.log(type);
    const data=[type,setup,punchline];
    let sql = 'INSERT INTO jokes (type,setup,punchline) VALUES ($1,$2,$3)';
    client.query(sql,data).then(()=>{
        console.log('done');
    }).catch(err=>console.log('ERROR while insert'));
    res.redirect('/');
})

app.get('/myFav',(req,res)=>{
    const sql = 'SELECT * FROM jokes';
    client.query(sql).then(result=>{
        console.log('Go Go ');
        console.log(result.rows);
        res.render('pages/fav',{data:result.rows});
    }).catch(err=>console.log('Why God Why'))
    
})

app.get('/update/:id',(req,res)=>{
    const id = req.params.id;
    console.log(id);
    const sql = 'SELECT * FROM jokes WHERE id =$1';
    client.query(sql,[id]).then(result=>{
        console.log(result.rows);
        res.render('pages/update',{data:result.rows});
    }).catch(err=>console.log('Why God Why'))


})


app.put('/update/:id',(req,res)=>{
    console.log(req.body);
    const type = req.body.type;
    const setup = req.body.setup;
    const punchline = req.body.punchline;
    let arr = [type,setup,punchline,req.params.id];
    const sql ='UPDATE  jokes SET type=$1 , setup=$2,punchline=$3  WHERE id=$4';
    client.query(sql,arr).then(result=>{
        res.redirect('/myFav')
    }
    ).catch(err=>console.log('updating ERROR'))
})

app.delete('/delete/:id',(req,res)=>{
    const id = parseInt(req.params.id);
    console.log(id);
    let sql = 'DELETE from jokes WHERE id=$1';
    client.query(sql,[id]).then(()=>{
        res.redirect('/myFav');
    }).catch(err=>console.log('ERR while delete'))
})

// connection to Db and server

client.connect().then(() => {
    console.log('DB Connect')
    app.listen(PORT || process.env.PORT, () => {
        console.log('connected Succsess', process.env.PORT)
    })
}).catch(err => console.log('ERROR DB'))
