(function() {
	var fs = require('fs');
	var express = require('express');
	var http = require('http');
	var mysql = require('mysql');
	var bodyParser = require('body-parser');
	var parseXlsx = require('xlsx');
	var csv = require('fast-csv');
	var app = express();
    var client = require('twilio')(
        'AC5428b55a4f53db74fee7425898415543',
        '6d2d4b5c56b96a3980dc81c00a7c241d'
    );

	app.set('port', process.env.PORT || 9051);
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-XSRF-TOKEN, Content-Type, Accept");
		next();
	});
	app.use(bodyParser.json());

	var pool = mysql.createPool({
		host: 'orzatestinginstance.crkgmcy3tvtc.us-east-1.rds.amazonaws.com',
		user: 'JCGutierrez2017',
		port: '3306',
		password: 'HryvniaUcr4n14',
		multipleStatements: true
	});

	pool.getConnection(function(err,connection){
		if(err){
			process.env['msg'] = 'unable to connect to RDS -' + err;
		 return;
		};

		// send sms to cell phone
        app.get('/login/:user/:phone/:random', function(req, res){
            var userName = req.params.user;
            var userPhone = req.params.phone;
            var verifyNum = req.params.random;

            var sqlLine = "select * from OrzaDevelopmentDB.saver where user_name_saver = '" + userName + "'";
            sqlLine = sqlLine + " and phone_saver = '" + userPhone + "'";

            connection.query(sqlLine,function(err, rows){
                if(err) throw err;
                if (rows.length > 0){
                    if (rows[0].confirmed_saver == 1){
                        res.json(rows);
                    }else{
                        client.messages.create({
                            from : '+1 610-679-9200',
                            to : userPhone,
                            body : verifyNum
                        }, function(err, message){
                            if (err){
                                console.log(err.message);
                            }
                        });
                        res.json("verify");
                    }
                }else{
                    var sqlLine = "select * from OrzaDevelopmentDB.saver where user_name_saver = '" + userName + "'";
                    sqlLine = sqlLine + " or phone_saver = '" + userPhone + "'";
                    connection.query(sqlLine,function(err, rows){
                        if (rows.length == 0){
                            var curDate = new Date();
                            var month = (curDate.getMonth()+1 < 10) ? '0'+(curDate.getMonth()+1) : (curDate.getMonth()+1);
                            var day = (curDate.getDate()<10) ? '0'+curDate.getDate() : curDate.getDate();

                            var param1 = userName;
                            var param2 = userPhone;
                            var param3 = 0;
                            var param4 = 1;
                            var param5 = curDate.getFullYear() + '-' + (month) + '-' + day;

                            sqlLine = "insert into OrzaDevelopmentDB.saver " +
                                "(user_name_saver, phone_saver, confirmed_saver, fp_id_saver, date_created_saver)" +
                                " values (";
                            var sqlValues = "'"+param1+"'" + ',' + "'"+param2+"'"  + ',' + param3  + ',' + param4  + ',' + "'"+param5+"'";
                            sqlLine = sqlLine + sqlValues + ")";

                            console.log(sqlLine);
                            connection.query(sqlLine,function(err,inserted){
                                if(err) throw err;
                            });

                            client.messages.create({
                                from : '+1 610-679-9200',
                                to : userPhone,
                                body : verifyNum
                            }, function(err, message){
                                if (err){
                                    console.log(err.message);
                                }
                            });
                            res.json("verify");
                        }
                    });
                }
            });


            // console.log("sms sent");
            // res.json("ok");
        });

		// '/ret1'
		app.get('/fundheader', function(req, res){
			var sqlLine1 = "select fund_id_alias_fund, alias, alias_match_1, alias_match_2, alias_match_3 from OrzaDevDB.alias_fund";
			connection.query(sqlLine1, function(err,fundnames){
				if(err) throw err;
				res.json(fundnames);
			});
		});

		// '/ret'
		app.get('/ret/:sDate', function(req, res){
			var startDate = req.params.sDate;
			var sqlLine = "select date_value_pr_fund, fund_id_pr_fund, pr_fund from OrzaDevDB.price_fund as a where a.date_value_pr_fund >= " + "'" + startDate +"'";
			connection.query(sqlLine,function(err,rows){
				if(err) throw err;
				res.json(rows);
			});
		});

		// '/userInfo'
		app.get('/userPortList', function(req, res){
			var sqlLine = "select portfolio_id, portfolio_name_saver, portfolio_goal_type_saver, portfolio_ccy_saver from OrzaDevDB.portfolio";
			connection.query(sqlLine,function(err,portnames){
				if(err) throw err;
				res.json(portnames);
			});
		});

		app.get('/transaction/:portid', function(req, res){
			var portfolio_id = req.params.portid;
			var sqlLine;
			if (portfolio_id == "all"){
				sqlLine = "select * from OrzaDevDB.transaction";
			}else{
				sqlLine = "select * from OrzaDevDB.transaction where transaction_portfolio_id = '" + portfolio_id + "'";
			}
			connection.query(sqlLine,function(err,transactions){
				if(err) throw err;
				res.json(transactions);
			});
		});

		app.post('/buy', function(req, res){
			console.log('BUY');
			var pObject = req.body.user;
			if (pObject.length > 0){
				var portfolio_ID = pObject[0].portfolio_id;
				var strDate = pObject[0].nowDate;
				var sqlPortfolio = "select portfolio_id from OrzaDevDB.portfolio where portfolio_id = '" + portfolio_ID + "'";
				connection.query(sqlPortfolio, function(err, portID){
					if (err) throw err;
					// res.json(portID);
					if (portID.length > 0){
						// same portfolio id is existed
						var sqlLine = "insert into OrzaDevDB.transaction " +
								"(transaction_portfolio_id, transaction_saver_id, fund_id_bought, units_bought, fund_id_sold, units_sold, date_value_transaction)" +
								" values ";
						var sqlValues = "";

						for (var i = 0; i < pObject.length; i ++){
							var param1 = pObject[i].portfolio_id;
							var param2 = pObject[i].saver_id;
							var param3 = pObject[i].fund_id_bought;
							var param4 = pObject[i].units_bought;
							var param5 = pObject[i].fund_id_sold;
							var param6 = pObject[i].units_sold;
							var param7 = pObject[i].date_value_transaction;
							var param8 = pObject[i].nowDate;
							sqlValues += "('"+param1+"'" + ',' + param2  + ',' + param3  + ',' + param4  + ',' + param5  + ',' + param6  + ',' + "'" + param7 + "')";
							if (i != pObject.length - 1) sqlValues += ",";
						}
						sqlLine += sqlValues;
						connection.query(sqlLine, function(err, exData){
							if(err) throw err;
							// res.json(exData);
						});
					}
					else{
						// there isn't same portfolio id on portfolio table
						var sqlLine = "insert into OrzaDevDB.portfolio " +
						"(portfolio_id, portfolio_name_saver, portfolio_goal_type_saver, portfolio_ccy_saver, date_created_portfolio_saver)" +
						" values (";
						var sqlValues = "'"+portfolio_ID+"'" + ',' + "'"+portfolio_ID+"'" + ',' + '1' + ',' + "'"+'COP'+"'" + ',' + "'"+strDate+"'";
						sqlLine = sqlLine + sqlValues + ")";
						connection.query(sqlLine, function(err, portdata){
							var sqlLine = "insert into OrzaDevDB.transaction " +
								"(transaction_portfolio_id, transaction_saver_id, fund_id_bought, units_bought, fund_id_sold, units_sold, date_value_transaction)" +
								" values ";
							var sqlValues = "";

							for (var i = 0; i < pObject.length; i ++){
								var param1 = pObject[i].portfolio_id;
								var param2 = pObject[i].saver_id;
								var param3 = pObject[i].fund_id_bought;
								var param4 = pObject[i].units_bought;
								var param5 = pObject[i].fund_id_sold;
								var param6 = pObject[i].units_sold;
								var param7 = pObject[i].date_value_transaction;
								var param8 = pObject[i].nowDate;
								sqlValues += "('"+param1+"'" + ',' + param2  + ',' + param3  + ',' + param4  + ',' + param5  + ',' + param6  + ',' + "'" + param7 + "')";
								if (i != pObject.length - 1) sqlValues += ",";
							}
							sqlLine += sqlValues;
							connection.query(sqlLine, function(err, exData){
								if(err) throw err;
								res.json(exData);
							});
						})
					}
				});
			}
		})

		// save transaction to transaction table in MySQL database
		app.get('/buy/:fund_id_bought/:units_bought/:fund_id_sold/:units_sold/:date_value_transaction/:portfolio_id/:saver_id/:nowDate', function(req, res){
			// default value of 1 for transaction_portfolio_id and transaction_saver_id 
			var param1 = req.params.portfolio_id;
			var param2 = req.params.saver_id;
			var param3 = req.params.fund_id_bought;
			var param4 = req.params.units_bought;
			var param5 = req.params.fund_id_sold;
			var param6 = req.params.units_sold;
			var param7 = req.params.date_value_transaction;
			var param8 = req.params.nowDate;

			// check portfolio_id from portfolio table of database
			var sqlPortfolio = "select portfolio_id from OrzaDevDB.portfolio where portfolio_id = '" + param1 + "'";
			connection.query(sqlPortfolio, function(err, portID){
				if (err) throw err;
				// res.json(portID);
				if (portID.length > 0){
					// same portfolio id is existed
				}
				else{
					// there isn't same portfolio id on portfolio table
					var sqlLine = "insert into OrzaDevDB.portfolio " +
					"(portfolio_id, portfolio_name_saver, portfolio_goal_type_saver, portfolio_ccy_saver, date_created_portfolio_saver)" +
					" values (";
					var sqlValues = "'"+param1+"'" + ',' + "'"+param1+"'" + ',' + '1' + ',' + "'"+'COP'+"'" + ',' + "'"+param8+"'";
					sqlLine = sqlLine + sqlValues + ")";
					connection.query(sqlLine, function(err, portdata){
						// console.log("success injected into portfolio");
					})
				}

				// variables to insert transaction if no other transaction for that fund on that date 
				var sqlLine = "insert into OrzaDevDB.transaction " +
				"(transaction_portfolio_id, transaction_saver_id, fund_id_bought, units_bought, fund_id_sold, units_sold, date_value_transaction)" +
				" values (";
				var sqlValues = "'"+param1+"'" + ',' + param2  + ',' + param3  + ',' + param4  + ',' + param5  + ',' + param6  + ',' + "'" + param7 + "'";
				sqlLine = sqlLine + sqlValues + ")";

				// variable to look for previous transactions if there is already a transaction for that fund on that date
				var beforeReq = "select * from OrzaDevDB.transaction ";
				beforeReq = beforeReq + "where fund_id_bought = " + param3;
				beforeReq = beforeReq + " and fund_id_sold = " + param5;
				beforeReq = beforeReq + " and date_value_transaction = '" + param7 + "'";
				beforeReq = beforeReq + " and transaction_portfolio_id = " + "'"+param1+"'";
				beforeReq = beforeReq + " and transaction_saver_id = " + "'"+param2+"'";

				// console.log(beforeReq);
				// if between insert and update of transaction
				connection.query(beforeReq, function(err, portdata){
					if(err) throw err;
					if (portdata.length > 0){

						// param4 = param4*1 + portdata[0].units_bought;
						// param6 = param6*1 + portdata[0].units_sold; 
						
						// update transaction if there is a previous transaction for that fund on that date
						sqlLine = "update OrzaDevDB.transaction set" +
						" units_bought = " + param4 +
						", units_sold = " + param6 +
						" where transaction_id = " + portdata[0].transaction_id;
						// console.log(sqlLine);
						connection.query(sqlLine, function(err, portdata){
							if(err) throw err;
							res.json(portdata);
						});
					}
					// insert transaction if there is no previous transaction for that fund on that date
					else{
						// console.log(sqlLine);
						connection.query(sqlLine, function(err, portdata){
							if(err) throw err;
							res.json(portdata);
						});
					}
				})
			});
		});

		app.get('/delete/:id', function(req, res){
			var trans_id = req.params.id;
			var sqlLine = "delete from OrzaDevDB.transaction where transaction_id=" + trans_id;
			connection.query(sqlLine,function(err,transactions){
				if(err) throw err;
				res.json(transactions);
			});
		});

		app.get('/deleteport/:id', function(req, res){
			var port_id = req.params.id;
			var sqlLine1 = "delete from OrzaDevDB.transaction where transaction_portfolio_id=" + "'" + port_id +"'";
			var sqlLine2 = "delete from OrzaDevDB.portfolio where portfolio_id=" + "'" + port_id +"'";
			connection.query(sqlLine1, function(err){
				if(err) throw err;
				connection.query(sqlLine2, function(err, transactions){
					if(err) throw err;
					res.json(transactions);
				});
			});
		});

		app.get('/addport/:portfolio_id/:valor/:moneda/:nowDate', function(req, res){
			var param1 = req.params.portfolio_id;
			var param2 = req.params.valor;
			var param3 = req.params.moneda;
			var param4 = req.params.nowDate;
			var sqlLine = "insert into OrzaDevDB.portfolio " +
					"(portfolio_id, portfolio_name_saver, portfolio_goal_type_saver, portfolio_ccy_saver, date_created_portfolio_saver)" +
					" values (";
			var sqlValues = "'"+param1+"'" + ',' + "'"+param1+"'" + ',' + "'"+param2+"'" + ',' + "'"+'COP'+"'" + ',' + "'"+param4+"'";
			sqlLine = sqlLine + sqlValues + ")";
			connection.query(sqlLine, function(err, portdata){
				res.json(portdata);
			})
		});

	});


	app.post('/getExcel', function(req, res){
		var csvdata = [];
		
		csv.fromString(req.body.user, {headers: true})
			.on("data", function(data){
					csvdata.push(data);
			})
			.on("end", function(){
					res.json(csvdata);
			});
	});

	http.createServer(app).listen(app.get('port'), function(){
		console.log("Express server listening on port " + app.get('port'));
	});

}).call(this);