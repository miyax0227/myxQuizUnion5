'use strict';

var appName = "myxQuizMain";
var app = angular.module(appName);

/*******************************************************************************
 * rule - ラウンド特有のクイズのルール・画面操作の設定
 ******************************************************************************/
app.factory('rule', [ 'qCommon', function(qCommon) {

  var rule = {};
  var win = qCommon.win;
  var lose = qCommon.lose;
  var setMotion = qCommon.setMotion;
  var addQCount = qCommon.addQCount;

  rule.judgement = judgement;
  rule.calc = calc;

  /*****************************************************************************
   * header - ルール固有のヘッダ
   ****************************************************************************/
  rule.head = [ {
	key : "mode",
	value : "position",
	style : "string"
  }, {
	key : "nowLot",
	value : 1,
	style : "number"
  } ];

  /*****************************************************************************
   * items - ルール固有のアイテム
   ****************************************************************************/
  rule.items = [ {
	key : "o",
	value : 0,
	style : "number",
	css : "o"
  }, {
	key : "x",
	value : 0,
	style : "number",
	css : "x",
	invisibleWhenZeroOrNull : true,
	repeatChar : "×"
  }, {
	key : "player",
	value : 1,
	style : "number"
  }, {
	key : "oo1",
	css : "oo oo1",
	value : 0,
	style : "number",
	repeatChar : "○"
  }, {
	key : "oo2",
	css : "oo oo2",
	value : 0,
	style : "number",
	repeatChar : "○"
  }, {
	key : "oo3",
	css : "oo oo3",
	value : 0,
	style : "number",
	repeatChar : "○"
  }, {
	key : "oo4",
	css : "oo oo4",
	value : 0,
	style : "number",
	repeatChar : "○"
  }, {
	key : "oo5",
	css : "oo oo5",
	value : 0,
	style : "number",
	repeatChar : "○"
  },

  {
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
  },

  {
	key : "priority",
	order : [ {
	  key : "status",
	  order : "desc",
	  alter : [ "win", 1, "lose", -1, 0 ]
	}, {
	  key : "o",
	  order : "desc"
	}, {
	  key : "x",
	  order : "asc"
	} ]
  } ];

  /*****************************************************************************
   * tweet - ルール固有のツイートのひな型
   ****************************************************************************/
  rule.tweet = {
	o : "${name}◯　→${o}◯ ${x}×",
	x : "${name}×　→${o}◯ ${x}× ${absent}休"
  };

  /*****************************************************************************
   * actions - プレイヤー毎に設定する操作の設定
   ****************************************************************************/
  rule.actions = [
  /*****************************************************************************
   * 正解時
   ****************************************************************************/
  {
	name : "○",
	css : "action_o",
	button_css : "btn btn-primary btn-lg",
	keyArray : "k1",
	enable0 : function(player, players, header, property) {
	  return (player.status == "normal" && !header.playoff);
	},
	action0 : function(player, players, header, property) {
	  setMotion(player, "o");
	  player.o++;
	  player["oo" + player.player]++;

	  angular.forEach(players, function(p) {
		if (p != player && [ "win", "lose" ].indexOf(p.status) < 0) {
		  rolling(p, property);
		}
	  });

	  if (player["oo" + player.player] >= property.norma[player.player - 1]) {
		rolling(player, property);
	  }

	  addQCount(players, header, property);
	},
	tweet : "o"
  },
  /*****************************************************************************
   * 誤答時
   ****************************************************************************/
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
	  if (property.penalty > 0) {
		player.absent = property.penalty;
		player.status = "preabsent";
	  }
	  rolling(player, property);
	  addQCount(players, header, property);
	},
	tweet : "x"
  },
  /*****************************************************************************
   * プレイヤーセレクト
   ****************************************************************************/
  {
	name : "1",
	css : "action_sl1",
	button_css : "btn btn-info",
	enable0 : function() {
	  return true;
	},
	action0 : function(player) {
	  player.player = 1;
	}
  }, {
	name : "2",
	css : "action_sl2",
	button_css : "btn btn-info",
	enable0 : function() {
	  return true;
	},
	action0 : function(player) {
	  player.player = 2;
	}
  }, {
	name : "3",
	css : "action_sl3",
	button_css : "btn btn-info",
	enable0 : function() {
	  return true;
	},
	action0 : function(player) {
	  player.player = 3;
	}
  }, {
	name : "4",
	css : "action_sl4",
	button_css : "btn btn-info",
	enable0 : function() {
	  return true;
	},
	action0 : function(player) {
	  player.player = 4;
	}
  }, {
	name : "5",
	css : "action_sl5",
	button_css : "btn btn-info",
	enable0 : function() {
	  return true;
	},
	action0 : function(player) {
	  player.player = 5;
	}
  } ];

  /*****************************************************************************
   * global_actions - 全体に対する操作の設定
   ****************************************************************************/
  rule.global_actions = [
  /*****************************************************************************
   * スルー
   ****************************************************************************/
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

  /*****************************************************************************
   * judgement - 操作終了時等の勝敗判定
   * 
   * @param {Array} players - players
   * @param {Object} header - header
   * @param {Object} property - property
   ****************************************************************************/
  function judgement(players, header, property) {
	angular.forEach(players.filter(function(item) {
	  /* rankがない人に限定 */
	  return (item.rank == 0);
	}), function(player, i) {
	  /* win条件 */
	  var winningPoint;
	  if (player.hasOwnProperty('winningPoint')) {
		winningPoint = player.winningPoint;
	  } else {
		winningPoint = property.winningPoint;
	  }

	  if (player.o >= winningPoint) {
		win(player, players, header, property);
		player.o = property.winningPoint;
	  }
	  /* lose条件 */
	  if (player.x >= property.losingPoint) {
		lose(player, players, header, property);
		player.x = property.losingPoint;
	  }
	});
  }

  /*****************************************************************************
   * calc - 従属変数の計算をする
   * 
   * @param {Array} players - players
   * @param {Object} items - items
   ****************************************************************************/
  function calc(players, header, items, property) {
	var pos = 0;
	angular.forEach(players, function(player, index) {
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
	  // キーボード入力時の配列の紐付け ローリング等の特殊形式でない場合はこのままでOK
	  // player.keyIndex = index;

	});

	angular.forEach(players, function(player, index) {
	  for (var i = 1; i <= 5; i++) {
		if (player.player == i) {
		  player["sl" + i] = 1;
		} else {
		  player["sl" + i] = 0;
		}
	  }
	});

  }

  function rolling(player, property) {
	var playerNum = player.player;
	var playerList = [];

	for (var i = 1; i <= 5; i++) {
	  if (playerNum < i && (player["oo" + i] < property.norma[i - 1])) {
		playerList.push(i);
	  }
	}
	for (var i = 1; i <= 5; i++) {
	  if (playerNum >= i && (player["oo" + i] < property.norma[i - 1])) {
		playerList.push(i);
	  }
	}

	if (playerList.length == 0) {
	  player.player = -1;
	} else {
	  player.player = playerList[0];
	}
  }

  return rule;
} ]);
