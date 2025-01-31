const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const { verifyToken } = require('../middleware/verifyToken');
const Article = require("../models/ArticleModel")
const sendMail = require("../middleware/sendMail")

const saltRounds = 10;
const jwt_code_secret = "SECRET_KEY";


router.get('/showTaches', verifyToken, (req,res)=>{
  jwt.verify(req.token, jwt_code_secret, (err,data)=>{
    if(err) 
            res.sendStatus(403);
    else{
      if(data.result.role == 'traducteur'){
        dbo.collection("announce").find({"traducteur.mail" : data.result.mail, "traduire": false}).toArray((err, result)=>{
          if(err) res.send({"ERREUR": err})
          else{
              res.send({"ANNOUNCES" : result})
          }
        })
      } else{
          res.send({"ERREUR" : "NO_ACCESS"})
      }
    }
  })
})

router.get('/findArticle/:title', verifyToken, (req,res)=>{
    jwt.verify(req.token, jwt_code_secret, (err,data)=>{
      if(err) 
              res.sendStatus(403);
      else{
        if(data.result.role == 'traducteur'){
          dbo.collection("announce").findOne({"title" : req.params.title}, (err, result)=>{
            if(err) res.send({"ERREUR": err})
            else{
                if(result.traducteur.mail == data.result.mail){
                    dbo.collection("article").findOne({"title" : req.params.title}, (err, rst)=>{
                        if(err) throw err
                        else{
                            console.log(rst)
                            res.send({"ARTICLE" : rst.text})
                        }
                    })
                } else{
                    res.send({"ERREUR": "PAS_ACCESS"})
                }
            }
          })
        } else{
            res.send({"ERREUR" : "NO_ACCESS"})
        }
      }
    })
})

router.put('/addTaductionArticle/:title', verifyToken, (req,res)=>{
    jwt.verify(req.token, jwt_code_secret, (err,data)=>{
        if(err) 
                res.sendStatus(403);
        else{

            if(data.result.role == 'traducteur'){
                if(req.body.traduction){
                    dbo.collection("announce").findOne({"title" : req.params.title}, (err, result)=>{
                        if(err) 
                            res.send({"ERREUR": err})
                        else{
                            if(result.traducteur.mail == data.result.mail){
                                if(result.traduire == false){
                                    dbo.collection("article").findOne({"title" : req.params.title}, (err, rsl)=>{
                                        if(err) throw err
                                        else{
                                            if(rsl){
                                                console.log(data)
                                                rsl.traduction = req.body.traduction
                                                dbo.collection("article").updateOne({title: req.params.title},{$set : rsl},(err, rst)=> {
                                                    if (err) res.send(err);
                                                    else{
                                                        dbo.collection("collaborateur").findOne({"mail": result.traducteur.mail}, (err, resT)=>{
                                                            if(err) res.send({"ERREUR": err})
                                                            else{
                                                                if(resT){
                                                                    resT.nbrTache -= 1
                                                                    dbo.collection("collaborateur").updateOne({"mail": result.traducteur.mail},{$set : resT}, async(err, rstUpdate)=> {
                                                                        if (err) res.send(err);
                                                                        else{
                                                                            result.traduire = true;
                                                                            dbo.collection("announce").updateOne({"title" : req.params.title},{$set : result}, async(err, resUpdate)=> {
                                                                              if (err) res.send(err);
                                                                              else{
                                                                                
                                                                              }
                                                                            })
                                                                            //send notification a responsable
                                                                            text =' Bonjour '.concat(result.responsable.username).concat(`,  <br /></br > La traducion de la tache de sous-titre ${result.title} a été realisé`)
                                                                            await sendMail(result.responsable.mail, text);
                                                                            res.send({MESSAGE : "UPDATE_SUCCES"});
                                                                        }
                                                                    })
                                                                } 
                                                            }
                                                        })
                                                    }
                                                })
                                            } else{
                                                res.send({"ERREUR" : "PAS_ENCOURE_REDIGE"})
                                            }
                                        }
                                    })
                                }else {
                                    res.send({"ERREUR": "DEJA_TRADUIRE"})
                                }
                            } else{
                                res.send({"ERREUR": "NO_ACCESS"})
                            }
                        }
                    })
                } else{
                    res.send({"ERREUR" : "BODY_ERROR"})
                }
            } else{
              res.send({"ERREUR" : "NO_ACCESS"})
          }
        }
      })
})

module.exports = router;