'use strict';

var appName = "myxQuizMain";
var app = angular.module(appName);

/*******************************************************************************
 * rule - ラウンド特有のクイズのルール・画面操作の設定
 ******************************************************************************/
app.factory('rule', ['qCommon', function (qCommon) {

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
  rule.head = [{
    key: "mode",
    value: "position",
    style: "string"
  }, {
    key: "nowLot",
    value: 1,
    style: "number"
  }];

  /*****************************************************************************
   * items - ルール固有のアイテム
   ****************************************************************************/
  rule.items = [{
    key: "nameLat",
    css: "nameLat",
    htrans: 4.1
  }];

  /*****************************************************************************
   * decor - 装飾用クラスリスト
   ****************************************************************************/
  rule.decor = [];

  /*****************************************************************************
   * tweet - ルール固有のツイートのひな型
   ****************************************************************************/
  rule.tweet = {};

  /*****************************************************************************
   * actions - プレイヤー毎に設定する操作の設定
   ****************************************************************************/
  rule.actions = [];

  /*****************************************************************************
   * global_actions - 全体に対する操作の設定
   ****************************************************************************/
  rule.global_actions = [];

  /*****************************************************************************
   * judgement - 操作終了時等の勝敗判定
   * 
   * @param {Array} players - players
   * @param {Object} header - header
   * @param {Object} property - property
   ****************************************************************************/
  function judgement(players, header, property) {
    angular.forEach(players.filter(function (item) {
      /* rankがない人に限定 */
      return (item.rank == 0);
    }), function (player, i) {

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
    var positionArray = [0, 0, 0, 0, 0, 0, 0];

    angular.forEach(players, function (player, index) {
      // 横向き名前
      player.nameLat = player.name;

      // 位置計算
      player.line = "rev" + player.lot;
      player.keyIndex = -1;
      player.position = positionArray[player.lot]++;

      // キーボード入力時の配列の紐付け ローリング等の特殊形式でない場合はこのままでOK
      // player.keyIndex = index;

    });
  }

  return rule;
}]);