'use strict';

var appName = "myxQuizMain";
var app = angular.module(appName);

/*******************************************************************************
 * svg - ラウンド特有の表示テンプレート
 ******************************************************************************/
app.directive('svg', function() {
  return {
	restrict : 'A',
	transclude : true,
	templateUrl : '../../template/union-star.html'
  }
});

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

  // ルール特有の定数
  var con = [ [], [ 3, 4 ], [ 4, 5 ], [ 5, 1 ], [ 1, 2 ], [ 2, 3 ] ];
  var pnt = [ [], [ 5, 2 ], [ 1, 3 ], [ 2, 4 ], [ 3, 5 ], [ 4, 1 ] ];

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
	key : "nameLat",
	css : "nameLat",
	htrans : 4.1
  }, {
	key : "o",
	value : 0,
	style : "number",
	css : "o",
	chance : true
  }, {
	key : "x",
	value : 0,
	style : "number",
	css : "x",
	invisibleWhenZeroOrNull : true,
	repeatChar : "×",
	pinch : true
  }, {
	key : "player",
	value : 0,
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
   * decor - 装飾用クラスリスト
   ****************************************************************************/
  rule.decor=["chance","pinch"];
  
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
	return (player["sl" + p] == 1) && (player.status == "normal");
  }

  function action00(p, player, players, header, property) {
	if (player.player == 0) {
	  player.player = p;
	  setMotion(player, "o");
	  addQCount(players, header, property);

	} else {
	  angular.forEach(pnt, function(link, index) {
		if (link.indexOf(p) >= 0 && link.indexOf(player.player) >= 0) {
		  player["oo" + index] = 1;
		}
	  });
	  player.o++;
	  player.player = 0;
	  setMotion(player, "o");
	  addQCount(players, header, property);

	}
  }
  ;

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
	  var winningPoint = 5;

	  if (player.o >= winningPoint) {
		win(player, players.filter(function(p) {
		  return p.lot == player.lot;
		}), header, property);
		player.o = winningPoint;
	  }
	  /* lose条件 */
	  if (player.x >= property.losingPoint) {
		lose(player, players.filter(function(p) {
		  return p.lot == player.lot;
		}), header, property);
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
	  
	  // pinch・chanceの計算
	  player.chance = (player.o == 4) && (player.player != 0);
	  player.pinch = (property.losingPoint - player.x == 1);
	  
	  // キーボード入力時の配列の紐付け ローリング等の特殊形式でない場合はこのままでOK
	  // player.keyIndex = index;

	});

	angular.forEach(players, function(player) {
	  for (var i = 1; i <= 5; i++) {
		// 1人目の正解者設定が無い場合の場合
		if (player.player == 0) {
		  // 未正解のリンクがある場合
		  if (pnt.filter(function(p, index) {
			return p.indexOf(i) >= 0 && player["oo" + index] == 0
		  }).length > 0) {
			// 解答権あり
			player["sl" + i] = 1;

			// 全てのリンクが正解済みの場合
		  } else {
			// 解答権無し
			player["sl" + i] = 0;
		  }

		  // 1人目の正解者設定があり、自分が2人目の対象者に含まれる場合
		} else if (con[player.player].indexOf(i) >= 0) {
		  // そのリンクが未正解の場合
		  if (pnt.filter(function(p, index) {
			var pp = player.player;
			return (p.indexOf(i) >= 0) && (p.indexOf(pp) >= 0) && (player["oo" + index] == 0);
		  }).length > 0) {
			// 解答権あり
			player["sl" + i] = 1;

			// そのリンクが正解済みの場合
		  } else {
			// 解答権無し
			player["sl" + i] = 0;
		  }

		  // 1人目の正解者設定があり、自分が2人目の対象者に含まれない場合
		} else {
		  // 解答権なし
		  player["sl" + i] = 0;

		}
	  }
	});

  }

  return rule;
} ]);
