(function() {
	var fs = require('fs');
	var express = require('express');
	var http = require('http');
	var https = require('https');
	var mysql = require('mysql');
	var bodyParser = require('body-parser');
	var parseXlsx = require('xlsx');
	var csv = require('fast-csv');
	var app = express();
	var cron = require('node-cron');
	var winston = require('winston');
	var client = require('twilio')(
		'AC5428b55a4f53db74fee7425898415543',
		'6d2d4b5c56b96a3980dc81c00a7c241d'
	);

	var logger = new winston.Logger({
		transports: [
			new winston.transports.Console(),
			new winston.transports.File({ filename: 'server.log' })
		]
	});

	app.set('port', process.env.PORT || 9051);
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-XSRF-TOKEN, Content-Type, Accept");
		next();
	});
	app.use(bodyParser.json());

	var task = cron.schedule('0 4 * * *', function() { //'*/10 * * * * *'
		logger.info("Cron schedule start, update DB data");
		getAliases()
			.then(response => {
				let aliasArr = [];
				console.log('number of currencies to be updated - ', response.length);
				for (var i = 0; i < response.length; i++) {
					aliasArr.push([response[i].alias_match_1, response[i].fund_id_alias_fund]);
				}
				return aliasArr;
			})
			.then(aliasArr => {
				return getMaxDate(aliasArr);
			})
			.then(data => {
				Promise.all( data.aliasArr.map(httpGet) )
					.then(
						response => { return sortDataForUpdate(response, data) },
						error => logger.info("Error: " + error.message)
					)
					.then(
						response => updatePriceFundCrypto(response)
					);
			})
			.catch(error => {
				logger.info("Error res: " + error.message);
			});
		// task.stop();
	}, false);
	task.start();

	function sortDataForUpdate(data, data2) {
		var priceArr = [];
		var newDataArray = [];
		var startPos = 0;

		for (var i = 0; i < data.length; i++) {
			priceArr.push(JSON.parse(data[i]).price);
		}

		for (var i = 0; i < priceArr.length; i++) {
			for (var k = 0; k < priceArr[i].length; k++) {
				var date = new Date(priceArr[i][k][0]);
				priceArr[i][k][0] = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
				if (priceArr[i][k][0] === maxDate) {
					startPos = k+1;
				}
			}
			for (var k = startPos; k < priceArr[i].length-2; k++) {
				newDataArray.push("(" + data2.aliasArr[i][1] + "," + priceArr[i][k][1] + ",'" + priceArr[i][k][0] + "')");
			}
		}
		return newDataArray;
	}

	function httpGet(alias) {
		return new Promise(function(resolve, reject) {
			https.get('https://coincap.io/history/365day/' + alias[0], (resp) => {
				let data = '';

				// A chunk of data has been recieved.
				resp.on('data', (chunk) => {
					data += chunk;
				});

				// The whole response has been received. Print out the result.
				resp.on('end', () => {
					resolve(data);
				});

			}).on("error", (err) => {
				reject(err);
			});
		});}

	
	var pool = mysql.createPool({
		// host: 'orzatestinginstance.crkgmcy3tvtc.us-east-1.rds.amazonaws.com',
		// user: 'JCGutierrez2017',
		// password: 'HryvniaUcr4n14',
		host: 'orzacryptocurrencyaws.crkgmcy3tvtc.us-east-1.rds.amazonaws.com',
		user: 'orzacyptoAWS',
		password: 'W1z3Orz4Ukr',
		port: '3306',
		multipleStatements: true
	});

	pool.getConnection(function(err,connection){
		if(err){
			process.env['msg'] = 'unable to connect to RDS -' + err;
		 return;
		};

		getAliases = function() {
			return new Promise(function(resolve, reject) {
				var sqlLine = "select fund_id_alias_fund, alias_match_1 from OrzaDevelopmentDB.alias_fund_crypto where fund_id_alias_fund <= 50";
				connection.query(sqlLine, function(err, rows){
					if (err) reject(err);
					if (!rows.length) {
						reject("Empty getAliases request result");
					}
					resolve(rows);
				});
			});
		}

		getMaxDate = function(aliasArr) {
			return new Promise(function(resolve, reject) {
				var sqlLine = "select max(date_value_pr_fund) as maxDate from OrzaDevelopmentDB.price_fund_crypto where fund_id_pr_fund = 1";
				connection.query(sqlLine, function(err, rows){
					if (err) reject(err);
					if (!rows) {
						reject("Empty getMaxDate request result");
					}
					else {
						var date = new Date(rows[0].maxDate);
						maxDate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
						resolve({aliasArr: aliasArr, maxDate: maxDate});
					}
				});

			});
		}

		updatePriceFundCrypto = function(insertDataStr) {
			return new Promise(function(resolve, reject) {
				var insertLine = "INSERT INTO OrzaDevelopmentDB.price_fund_crypto (fund_id_pr_fund, pr_fund, date_value_pr_fund) VALUES ";
				var rowNum = insertDataStr.length;
				insertDataStr = insertDataStr.join(',');
				connection.query(insertLine + insertDataStr, function(err, rows){
					if (err) reject(err);
					logger.info('Update complete, updated ' + rowNum + ' records!');
					resolve('Update complete, updated ' + rowNum + ' records!');
				});
			});
		}

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
						res.json(rows[0]);
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
		});

		// '/ret1'
		app.get('/fundheader', function(req, res){
			var sqlLine1 = "select fund_id_alias_fund, alias, alias_match_1, alias_match_2, alias_match_3 from OrzaDevelopmentDB.alias_fund_crypto";
			connection.query(sqlLine1, function(err,fundnames){
				if(err) throw err;
				res.json(fundnames);
			});
		});

		// '/ret'
		app.get('/ret/:sDate', function(req, res){
			var startDate = req.params.sDate;
			//names are reduced to save space while saving data to the LocalStorage
			var sqlLine = "select date_value_pr_fund as d, fund_id_pr_fund as i, pr_fund as f from OrzaDevelopmentDB.price_fund_crypto as a where a.date_value_pr_fund >= " + "'" + startDate +"'";
			// var sqlLine = "select date_value_pr_fund, fund_id_pr_fund, pr_fund, pr_1, pr_2, pr_3, pr_4, pr_5, pr_6, pr_7, pr_8, pr_9 from OrzaDevelopmentDB.price_fund_crypto_test as a where a.date_value_pr_fund >= " + "'" + startDate +"'";
			connection.query(sqlLine,function(err,rows){
				if(err) throw err;
				for (var i = 0; i < rows.length; i++) {
					rows[i].d = rows[i].d.getFullYear() + '-' + ('0' + (rows[i].d.getMonth() + 1)).slice(-2) + '-' + ('0' + rows[i].d.getDate()).slice(-2);
				}
				res.json(rows);
			});
		});

		// '/userInfo'
		app.get('/userPortList', function(req, res){
			var sqlLine = "select portfolio_id, portfolio_name_saver, portfolio_goal_type_saver, portfolio_ccy_saver from OrzaDevelopmentDB.portfolio_crypto";
			connection.query(sqlLine,function(err,portnames){
				if(err) throw err;
				res.json(portnames);
			});
		});

		app.get('/transaction/:portid', function(req, res){
			var portfolio_id = req.params.portid;
			var sqlLine;
			if (portfolio_id == "all"){
				sqlLine = "select * from OrzaDevelopmentDB.transaction_crypto";
			}else{
				sqlLine = "select * from OrzaDevelopmentDB.transaction_crypto where transaction_portfolio_id = '" + portfolio_id + "'";
			}
			connection.query(sqlLine,function(err,transactions){
				if(err) throw err;
				res.json(transactions);
			});
		});

		app.post('/signIn', function(req, res){
			var userObject = req.body.user;
			if (userObject && userObject.id) {
				var sqlLine = "select * from OrzaDevelopmentDB.users where saver_id = '" + userObject.id + "'";
					connection.query(sqlLine,function(err, rows){
						if (rows.length == 0){
							var param1 = userObject.id;
							var param2 = userObject.email;
							var param3 = userObject.firstName || '';
							var param4 = userObject.lastName || '';
							var param5 = userObject.name || '';

							sqlLine = "insert into OrzaDevelopmentDB.users " +
								"(saver_id, email, first_name, last_name, name)" +
								" values (";
							var sqlValues = "'"+param1+"','"+param2+"','"+param3+"','"+param4+"','"+param5+"'";
							sqlLine = sqlLine + sqlValues + ")";

							connection.query(sqlLine,function(err,inserted){
								if(err) throw err;
							});

							res.json("User stored to DB");
						} else {
							res.json("User already exist");
						}
					});
			}
		});

		app.post('/buy', function(req, res){
			var pObject = req.body.user;
			if (pObject.length > 0){
				var portfolio_ID = pObject[0].portfolio_id;
				var strDate = pObject[0].nowDate;
				var sqlPortfolio = "select portfolio_id from OrzaDevelopmentDB.portfolio_crypto where portfolio_id = '" + portfolio_ID + "'";
				connection.query(sqlPortfolio, function(err, portID){
					if (err) throw err;
					// res.json(portID);
					if (portID.length > 0){
						// same portfolio id is existed
						var sqlLine = "insert into OrzaDevelopmentDB.transaction_crypto " +
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
						var sqlLine = "insert into OrzaDevelopmentDB.portfolio_crypto " +
						"(portfolio_id, portfolio_name_saver, portfolio_goal_type_saver, portfolio_ccy_saver, date_created_portfolio_saver)" +
						" values (";
						var sqlValues = "'"+portfolio_ID+"'" + ',' + "'"+portfolio_ID+"'" + ',' + '1' + ',' + "'"+'COP'+"'" + ',' + "'"+strDate+"'";
						sqlLine = sqlLine + sqlValues + ")";
						connection.query(sqlLine, function(err, portdata){
							var sqlLine = "insert into OrzaDevelopmentDB.transaction_crypto " +
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
			var sqlPortfolio = "select portfolio_id from OrzaDevelopmentDB.portfolio_crypto where portfolio_id = '" + param1 + "'";
			connection.query(sqlPortfolio, function(err, portID){
				if (err) throw err;
				// res.json(portID);
				if (portID.length > 0){
					// same portfolio id is existed
				}
				else{
					// there isn't same portfolio id on portfolio table
					var sqlLine = "insert into OrzaDevelopmentDB.portfolio_crypto " +
					"(portfolio_id, portfolio_name_saver, portfolio_goal_type_saver, portfolio_ccy_saver, date_created_portfolio_saver)" +
					" values (";
					var sqlValues = "'"+param1+"'" + ',' + "'"+param1+"'" + ',' + '1' + ',' + "'"+'COP'+"'" + ',' + "'"+param8+"'";
					sqlLine = sqlLine + sqlValues + ")";
					connection.query(sqlLine, function(err, portdata){
					})
				}

				// variables to insert transaction if no other transaction for that fund on that date 
				var sqlLine = "insert into OrzaDevelopmentDB.transaction_crypto " +
				"(transaction_portfolio_id, transaction_saver_id, fund_id_bought, units_bought, fund_id_sold, units_sold, date_value_transaction)" +
				" values (";
				var sqlValues = "'"+param1+"'" + ',' + param2  + ',' + param3  + ',' + param4  + ',' + param5  + ',' + param6  + ',' + "'" + param7 + "'";
				sqlLine = sqlLine + sqlValues + ")";

				// variable to look for previous transactions if there is already a transaction for that fund on that date
				var beforeReq = "select * from OrzaDevelopmentDB.transaction_crypto ";
				beforeReq = beforeReq + "where fund_id_bought = " + param3;
				beforeReq = beforeReq + " and fund_id_sold = " + param5;
				beforeReq = beforeReq + " and date_value_transaction = '" + param7 + "'";
				beforeReq = beforeReq + " and transaction_portfolio_id = " + "'"+param1+"'";
				beforeReq = beforeReq + " and transaction_saver_id = " + "'"+param2+"'";

				// if between insert and update of transaction
				connection.query(beforeReq, function(err, portdata){
					if(err) throw err;
					if (portdata.length > 0){

						// param4 = param4*1 + portdata[0].units_bought;
						// param6 = param6*1 + portdata[0].units_sold; 
						// update transaction if there is a previous transaction for that fund on that date
						sqlLine = "update OrzaDevelopmentDB.transaction_crypto set" +
						" units_bought = " + param4 +
						", units_sold = " + param6 +
						" where transaction_id = " + portdata[0].transaction_id;
						connection.query(sqlLine, function(err, portdata){
							if(err) throw err;
							res.json(portdata);
						});
					}
					// insert transaction if there is no previous transaction for that fund on that date
					else{
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
			var sqlLine = "delete from OrzaDevelopmentDB.transaction_crypto where transaction_id=" + trans_id;
			connection.query(sqlLine,function(err,transactions){
				if(err) throw err;
				res.json(transactions);
			});
		});

		app.get('/deleteport/:id', function(req, res){
			var port_id = req.params.id;
			var sqlLine1 = "delete from OrzaDevelopmentDB.transaction_crypto where transaction_portfolio_id=" + "'" + port_id +"'";
			var sqlLine2 = "delete from OrzaDevelopmentDB.portfolio_crypto where portfolio_id=" + "'" + port_id +"'";
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
			var sqlLine = "insert into OrzaDevelopmentDB.portfolio_crypto " +
					"(portfolio_id, portfolio_name_saver, portfolio_goal_type_saver, portfolio_ccy_saver, date_created_portfolio_saver)" +
					" values (";
			var sqlValues = "'"+param1+"'" + ',' + "'"+param1+"'" + ',' + "'"+param2+"'" + ',' + "'"+'COP'+"'" + ',' + "'"+param4+"'";
			sqlLine = sqlLine + sqlValues + ")";
			connection.query(sqlLine, function(err, portdata){
				res.json(portdata);
			})
		});

//=====================================================================================================

		app.post('/setFundNames', function(req, res) {
			var data = req.body.data;
			var insertDataStr = '';
			var sep = ',';
			for (var i = 0; i < data.arrShort.length; i++) {
				sep = i === data.arrShort.length - 1 ? '' : sep;
				insertDataStr += "(" + (i + 1) + ",'" + data.arrFull[i] + "','" + data.arrShort[i] + "')" + sep;
			}

			var query = connection.query("INSERT INTO OrzaDevelopmentDB.alias_fund_crypto (fund_id_alias_fund, alias, alias_match_1) VALUES " + insertDataStr, function (error, results, fields) {
				if (error) throw error;
				else res.json('setFundNames success');
			});
		});

		app.get('/setPriceFunds', function(req, res){
			var startDate = req.params.sDate;
			var sqlLine = "select fund_id_alias_fund, alias_match_1 from OrzaDevelopmentDB.alias_fund_crypto where fund_id_alias_fund <= 50";
			var req = function(row, id) {
				https.get('https://coincap.io/history/365day/' + row.alias_match_1, (resp) => {
					let data = '';
					let rowId = row.fund_id_alias_fund;

					// A chunk of data has been recieved.
					resp.on('data', (chunk) => {
						data += chunk;
					});

					// The whole response has been received. Print out the result.
					resp.on('end', () => {
						let price365Arr = JSON.parse(data).price;

						var insertDataStr = '';
						var sep = ',';
						var price365ActualLength = 364;
						var dataLength = price365Arr.length > price365ActualLength ? price365ActualLength : price365Arr.length;

						for (var k = 0; k < dataLength; k++) {
							var date = new Date(price365Arr[k][0]);

							var year = date.getFullYear();
							var month = date.getMonth() + 1;
							var day = date.getDate();

							month = month.toString().length === 1 ? '0' + month : month;
							day = day.toString().length === 1 ? '0' + day : day;

							var dateStr = year + '-' + month + '-' + day;

							sep = k === dataLength - 1 ? '' : sep;
							insertDataStr += "(" + rowId + "," + price365Arr[k][1] + ",'" + dateStr + "')" + sep;
						}

						var query = connection.query("INSERT INTO OrzaDevelopmentDB.price_fund_crypto_test (fund_id_pr_fund, pr_fund, date_value_pr_fund) VALUES " + insertDataStr, function (error, results, fields) {
							if (error) throw error;
						});
					});

				}).on("error", (err) => {
					console.log("Error: " + err.message);
				});
			}

			connection.query(sqlLine,function(err, rows){
				if(err) throw err;
				for (var i = 0; i < rows.length; i++) {
					req(rows[i], i);
				}
				console.log("done");
				res.json("done");
			});
		});

		// // functionality that stote test data to DB to check rate of parameter calculation
		// // the test data is bitcoin history data available at http://coincap.io/history/BTC
		// app.get('/setPriceFunds', function(req, res){
		// 	var startDate = req.params.sDate;
		// 	var sqlLine = "select fund_id_alias_fund, alias_match_1 from OrzaDevelopmentDB.alias_fund_crypto";

		// 	https.get('https://coincap.io/history/BTC', (resp) => {
		// 		var data = '';

		// 		// A chunk of data has been recieved.
		// 		resp.on('data', (chunk) => {
		// 			data += chunk;
		// 		});

		// 		// The whole response has been received. Print out the result.
		// 		resp.on('end', () => {
		// 			var priceArr = JSON.parse(data).price;

		// 			var insertDataStr = '';
		// 			var sep = ',';

		// 			for (var i = 1; i <= 50; i++) {
		// 				for (var k = 0; k < priceArr.length; k++) {
		// 					var date = new Date(priceArr[k][0]);
 
 
		// 					var year = date.getFullYear();
		// 					var month = date.getMonth() + 1;
		// 					var day = date.getDate();

		// 					month = month.toString().length === 1 ? '0' + month : month;
		// 					day = day.toString().length === 1 ? '0' + day : day;

		// 					var dateStr = year + '-' + month + '-' + day;

		// 					sep = (k === priceArr.length - 1 && i === 50) ? '' : sep;
		// 					insertDataStr += "(" + i + "," + priceArr[k][1] + ",'" + dateStr + "')" + sep;
		// 				}
		// 			}

		// 			var query = connection.query("INSERT INTO OrzaDevelopmentDB.price_fund_crypto_test (fund_id_pr_fund, pr_fund, date_value_pr_fund) VALUES " + insertDataStr, function (error, results, fields) {
		// 				if (error) throw error;
		// 			});

		// 		});

		// 	}).on("error", (err) => {
		// 		console.log("Error: " + err.message);
		// 	});
		// });
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