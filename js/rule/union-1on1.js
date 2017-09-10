'use strict';

var appName = "myxQuizMain";
var app = angular.module(appName);

/*******************************************************************************
 * rule - ラウンド特有のクイズのルール・画面操作の設定
 ******************************************************************************/
app.factory('rule', [
	'qCommon',
	function(qCommon) {

	  var rule = {};
	  var win = qCommon.win;
	  var lose = qCommon.lose;
	  var setMotion = qCommon.setMotion;
	  var addQCount = qCommon.addQCount;

	  rule.judgement = judgement;
	  rule.calc = calc;

	  /*************************************************************************
	   * header - ルール固有のヘッダ
	   ************************************************************************/
	  rule.head = [ {
		key : "mode",
		value : "position",
		style : "string"
	  }, {
		key : "nowLot",
		value : 1,
		style : "number"
	  } ];

	  /*************************************************************************
	   * items - ルール固有のアイテム
	   ************************************************************************/
	  rule.items = [ {
		key : "nameLat",
		css : "nameLat",
		htrans : 4.1
	  }, {
		key : "o",
		css : "o",
		chance : true
	  }, {
		key : "x",
		css : "x",
		value : 0,
		style : "number",
	  }, {
		key : "oo1",
		css : "oo oo1",
		value : 0,
		style : "number",
		left : true,
		right : true,
		chance1 : true,
		win1 : true,
		lose1 : true
	  }, {
		key : "oo2",
		css : "oo oo2",
		value : 0,
		style : "number",
		left : true,
		right : true,
		chance2 : true,
		win2 : true,
		lose2 : true
	  }, {
		key : "oo3",
		css : "oo oo3",
		value : 0,
		style : "number",
		left : true,
		right : true,
		chance3 : true,
		win3 : true,
		lose3 : true
	  }, {
		key : "oo4",
		css : "oo oo4",
		value : 0,
		style : "number",
		left : true,
		right : true,
		chance4 : true,
		win4 : true,
		lose4 : true
	  }, {
		key : "oo5",
		css : "oo oo5",
		value : 0,
		style : "number",
		left : true,
		right : true,
		chance5 : true,
		win5 : true,
		lose5 : true
	  }, {
		key : "sl1",
		css_img : "sl sl1",
		css_img_file : {
		  "1" : "select.png"
		}
	  }, {
		key : "sl2",
		css_img : "sl sl2",
		css_img_file : {
		  "1" : "select.png"
		}
	  }, {
		key : "sl3",
		css_img : "sl sl3",
		css_img_file : {
		  "1" : "select.png"
		}
	  }, {
		key : "sl4",
		css_img : "sl sl4",
		css_img_file : {
		  "1" : "select.png"
		}
	  }, {
		key : "sl5",
		css_img : "sl sl5",
		css_img_file : {
		  "1" : "select.png"
		}
	  }, {
		key : "priority",
		order : [ {
		  key : "status",
		  order : "desc",
		  alter : [ "win", 1, "lose", -1, 0 ]
		}, {
		  key : "o",
		  order : "desc"
		}, {
		  key : "rest",
		  order : "desc"
		} ]
	  } ];

	  /*************************************************************************
	   * decor - 装飾用クラスリスト
	   ************************************************************************/
	  rule.decor = [ "chance", "left", "right", "chance1", "chance2", "chance3", "chance4",
		  "chance5", "win1", "win2", "win3", "win4", "win5", "lose1", "lose2", "lose3", "lose4",
		  "lose5" ];

	  /*************************************************************************
	   * tweet - ルール固有のツイートのひな型
	   ************************************************************************/
	  rule.tweet = {
		o : "${name}◯　→${o}◯",
		x : "${name}×　→${o}◯"
	  };

	  /*************************************************************************
	   * actions - プレイヤー毎に設定する操作の設定
	   ************************************************************************/
	  rule.actions = [
	  /*************************************************************************
	   * 誤答時
	   ************************************************************************/
	  {
		name : "×",
		css : "action_x",
		button_css : "btn btn-danger btn-lg",
		keyArray : "k2",
		enable0 : function(player, players, header) {
		  return (player.status == "normal" && !header.playoff);
		},
		action0 : function(player, players, header, property) {
		  setMotion(player, "x");
		  player.x++;
		  addQCount(players, header, property);
		},
		tweet : "x"
	  },
	  /*************************************************************************
	   * プレイヤー毎の正解
	   ************************************************************************/
	  {
		name : "1",
		css : "action_sl1",
		button_css : "btn btn-info btn-lg",
		enable0 : function(player) {
		  return enable00(1, player);
		},
		action0 : function(player, players, header, property) {
		  action00(1, player, players, header, property);
		}
	  }, {
		name : "2",
		css : "action_sl2",
		button_css : "btn btn-info btn-lg",
		enable0 : function(player) {
		  return enable00(2, player);
		},
		action0 : function(player, players, header, property) {
		  action00(2, player, players, header, property);
		}
	  }, {
		name : "3",
		css : "action_sl3",
		button_css : "btn btn-info btn-lg",
		enable0 : function(player) {
		  return enable00(3, player);
		},
		action0 : function(player, players, header, property) {
		  action00(3, player, players, header, property);
		}
	  }, {
		name : "4",
		css : "action_sl4",
		button_css : "btn btn-info btn-lg",
		enable0 : function(player) {
		  return enable00(4, player);
		},
		action0 : function(player, players, header, property) {
		  action00(4, player, players, header, property);
		}
	  }, {
		name : "5",
		css : "action_sl5",
		button_css : "btn btn-info btn-lg",
		enable0 : function(player) {
		  return enable00(5, player);
		},
		action0 : function(player, players, header, property) {
		  action00(5, player, players, header, property);
		}
	  } ];

	  function enable00(p, player) {
		return (player["sl" + p] == 1) && (player.status == "normal") && (player.x == 0);
	  }

	  function action00(p, player, players, header, property) {
		player["oo" + p]++;
		setMotion(player, "o");
		angular.forEach(players, function(p) {
		  p.x = 0;
		});
		addQCount(players, header, property);
	  }
	  ;

	  /*************************************************************************
	   * global_actions - 全体に対する操作の設定
	   ************************************************************************/
	  rule.global_actions = [
	  /*************************************************************************
	   * スルー
	   ************************************************************************/
	  {
		name : "thru",
		button_css : "btn btn-default",
		group : "rule",
		keyboard : "Space",
		enable0 : function(players, header) {
		  return true;
		},
		action0 : function(players, header, property) {
		  addQCount(players, header, property);
		},
		tweet : "thru"
	  }, {
		name : "",
		button_css : "btn btn-default",
		group : "rule",
		indexes0 : function(players, header, property) {
		  return property.lots;
		},
		enable1 : function(index, players, header) {
		  return true;
		},
		action1 : function(index, players, header, property) {
		  header.nowLot = index;
		}
	  } ];

	  /*************************************************************************
	   * judgement - 操作終了時等の勝敗判定
	   * 
	   * @param {Array} players - players
	   * @param {Object} header - header
	   * @param {Object} property - property
	   ************************************************************************/
	  function judgement(players, header, property) {
		angular.forEach(players.filter(function(item) {
		  /* rankがない人に限定 */
		  return (item.rank == 0);
		}), function(player, i) {
		  /* win条件 */
		  var winningPoint = 3;

		  if (player.o >= winningPoint) {
			win(player, players.filter(function(p) {
			  return p.lot == player.lot;
			}), header, property);
			player.o = winningPoint;
		  }
		});
	  }

	  /*************************************************************************
	   * calc - 従属変数の計算をする
	   * 
	   * @param {Array} players - players
	   * @param {Object} items - items
	   ************************************************************************/
	  function calc(players, header, items, property) {
		var pos = 0;
		angular.forEach(players, function(player){		  
		  // lotNum
		  player.lotNum = players.filter(function(p,i){
			return p.lot == player.lot && i <= index
		  }).length;
		});
		
		angular.forEach(players, function(player, index) {
		  // 横向き名前
		  player.nameLat = player.name;

		  // 位置計算
		  if (player.lot == header.nowLot) {
			player.line = null;
			player.keyIndex = pos;
			player.position = (pos++);
		  } else if (player.lot > header.nowLot) {
			player.line = "left";
			player.keyIndex = -1;
			player.position = 0;
		  } else {
			player.line = "right";
			player.keyIndex = -1;
			player.position = 0;
		  }

		  // left, right
		  player.left = (player.lotNum == 1);
		  player.right = (player.lotNum == 2);

		  // キーボード入力時の配列の紐付け ローリング等の特殊形式でない場合はこのままでOK
		  // player.keyIndex = index;

		});

		angular.forEach(players, function(player) {
		  var o = 0;
		  var c = 0;
		  var rival = players.filter(function(p) {
			return (p.lot == player.lot) && (p.lotNum == r(player.lotNum));
		  })[0];

		  // 対戦相手とのスコア比較により従属変数を設定
		  for (var i = 1; i <= 5; i++) {
			if (player["oo" + i] >= property.norma[i - 1]) {
			  player["sl" + i] = 0;
			  player["win" + i] = true;
			  player["lose" + i] = false;
			  player["chance" + i] = false;
			  o++;
			} else if (rival["oo" + i] >= property.norma[i - 1]) {
			  player["sl" + i] = 0;
			  player["win" + i] = false;
			  player["lose" + i] = true;
			  player["chance" + i] = false;
			} else if (player.x > 0) {
			  player["sl" + i] = 0;
			  player["win" + i] = false;
			  player["lose" + i] = false;
			  if (player["oo" + i] == property.norma[i - 1] - 1) {
				player["chance" + i] = true;
				c++;
			  } else {
				player["chance" + i] = false;
			  }
			} else {
			  player["sl" + i] = 1;
			  player["win" + i] = false;
			  player["lose" + i] = false;
			  if (player["oo" + i] == property.norma[i - 1] - 1) {
				player["chance" + i] = true;
				c++;
			  } else {
				player["chance" + i] = false;
			  }
			}
		  }

		  player.o = o;
		  if(o == 2 && c > 0 && player.status == "normal" && rival.status == "normal"){
			player.chance = true;
		  }else{
			player.chance = false;
		  }

		  // 双方に×が付いている場合はリセット、１問進める
		  if (player.x > 0 && rival.x > 0) {
			player.x = 0;
			rival.x = 0;
			addQCount(players, header, property);
		  }

		});

		function r(i) {
		  if (i == 1) {
			return 2;
		  } else {
			return 1;
		  }
		}

	  }

	  return rule;
	} ]);
