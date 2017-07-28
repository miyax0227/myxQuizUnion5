'use strict';

var appName = "myxQuizIndex";
var app = angular.module(appName);

/*******************************************************************************
 * qFile - ファイル操作系の処理をまとめたservice
 * 
 * @class
 * @name qFile
 ******************************************************************************/
app.

service('qFile', [ '$window', '$interval', '$filter', '$uibModal',

function($window, $interval, $filter, $uibModal) {
  const
  fs = require('fs');
  const
  dir = __dirname + '/round';
  const
  nameListFile = __dirname + "/history/current/nameList.json";
  const
  remote = require('electron').remote;
  const
  Dialog = remote.dialog;
  const
  browserWindow = remote.BrowserWindow;
  const
  xlsx = require('xlsx');
  const
  shell = require('electron').shell;
  const
  profiles = require('./json/item.json').filter(function(item) {
	return item.hasOwnProperty('profile') && item.profile
  }).map(function(item) {
	return item.key
  });

  // excel.jsonからウィンドウサイズを取得
  var excelProperty = JSON.parse(fs.readFileSync(__dirname + '/json/excel.json', 'utf-8'));

  // window.jsonからウィンドウサイズを取得
  var windowData = JSON.parse(fs.readFileSync(__dirname + '/json/window.json', 'utf-8'));
  var windowParameter = "";
  windowParameter += 'width=' + windowData[2].width;
  windowParameter += ',height=' + windowData[2].height;
  windowParameter += ",left=" + windowData[2].left;
  windowParameter += ",top=" + windowData[2].top;

  var twitterWindowParameter = "";
  twitterWindowParameter += 'width=' + windowData[3].width;
  twitterWindowParameter += ',height=' + windowData[3].height;
  twitterWindowParameter += ",left=" + windowData[3].left;
  twitterWindowParameter += ",top=" + windowData[3].top;

  // roundsを設定
  var rounds = [];
  fs.readdirSync(dir).forEach(function(file) {
	// fileがファイルではない場合（＝ディレクトリの場合）
	if (!fs.statSync(dir + "/" + file).isFile()) {
	  var round = {
		// name - ラウンド名
		name : file,

		// historyFile - 履歴ファイルのフルパス
		historyFile : __dirname + '/history/current/' + file + '.json',

		// entryFile - エントリーファイルのフルパス
		entryFile : __dirname + '/history/current/' + file + '-entry.json',

		// qCount - 問目
		qCount : null,

		// initializable - 初期化可能か
		initializable : false,

		// startable - 開始可能か
		startable : false,

		// callable - 招集可能か
		callable : false,

		// click - ラウンド目クリック時の処理（ウィンドウオープン）
		click : function() {
		  $window.open("./round/" + file + "/board.html", file + " - control", windowParameter);
		},

		// initialize0 - 初期化クリック時の処理
		initialize0 : function(scope) {
		  var oldFile = __dirname + '/history/current/' + file + '.json';
		  var newFile = __dirname + '/history/current/' + file + '_' + dateString() + '.json';
		  fs.renameSync(oldFile, newFile);
		},

		// callUp0 - 招集処理
		callUp0 : function(scope) {
		  console.log(require('./round/' + file + "/entry.json"));
		  scope.tableContent = callMember(require('./round/' + file + "/entry.json"));
		  scope.tableHead = Object.keys(scope.tableContent[0]);
		  scope.tableTitle = file;
		  scope.tableFilename = __dirname + '/history/current/' + file + '-entry.json';
		}
	  };

	  rounds.push(round);
	}
  });

  // 名前リストファイルの存在
  var nameListExists = false;

  var t = $interval(function() {
	// 毎秒ファイル状態を確認

	// 名前リストファイルの存在確認
	try {
	  fs.statSync(nameListFile);
	  nameListExists = true;
	} catch (e) {
	  nameListExists = false;
	}

	// ラウンド毎のファイル確認
	angular.forEach(rounds, function(round) {
	  // 各ラウンドの履歴ファイルの存在確認
	  try {
		var data = JSON.parse(fs.readFileSync(round.historyFile, 'utf-8'));
		round.qCount = data.header.qCount;
		round.initializable = true;

	  } catch (e) {
		round.qCount = null;
		round.initializable = false;
	  }

	  // 各ラウンドのエントリーファイルの存在確認
	  try {
		fs.statSync(round.entryFile);
		round.startable = nameListExists;

	  } catch (e) {
		round.startable = false;
	  }

	  round.callable = nameListExists;
	});
  }, 1000);

  /*****************************************************************************
   * 履歴フォルダの初期化
   * 
   * @memberOf qFile
   ****************************************************************************/
  function initialize() {
	var oldFile = __dirname + '/history/current';
	var newFile = __dirname + '/history/' + dateString();
	var msg = "全ての履歴ファイルを初期化してもよろしいでしょうか ?";

	confirm(msg, function() {
	  fs.renameSync(oldFile, newFile);
	  fs.mkdirSync(oldFile);
	});
  }

  /*****************************************************************************
   * 名前リストを開く
   * 
   * @memberOf qFile
   * @param {object} scope - $scope
   ****************************************************************************/
  function openNameList(scope) {
	Dialog.showOpenDialog(null, {
	  properties : [ 'openFile' ],
	  title : 'ファイルを開く',
	  defaultPath : '.',
	  filters : [ {
		name : 'Excelファイル',
		extensions : [ 'xlsx', 'xls', 'xlsm' ]
	  } ]
	}, function(fileNames) {
	  var nameList = [];
	  var nameListColumn = [];

	  var workbook = xlsx.readFile(fileNames[0], {
		password : excelProperty.password
	  });
	  var worksheet = workbook.Sheets[excelProperty.sheetName];

	  // 指定したセルのテキストを取得する関数
	  function getTextByCell(row, column) {
		var cell = worksheet[xlsx.utils.encode_cell({
		  r : row,
		  c : column
		})];
		if (cell != null) {
		  return cell.w;
		} else {
		  return null;
		}

	  }

	  // セルの範囲
	  var range = worksheet['!ref'];
	  var rangeVal = xlsx.utils.decode_range(range);

	  for (var c = rangeVal.s.c; c <= rangeVal.e.c; c++) {
		var text = getTextByCell(rangeVal.s.r, c);
		if (text != null && text != "") {
		  nameListColumn.push(getTextByCell(rangeVal.s.r, c));
		}
	  }

	  for (var r = rangeVal.s.r + 1; r <= rangeVal.e.r; r++) {
		var player = {};

		for (var c = rangeVal.s.c; c <= rangeVal.e.c; c++) {
		  var title = getTextByCell(rangeVal.s.r, c);
		  var text = getTextByCell(r, c);

		  if (title != null && title != "" && text != null && text != "") {
			player[title] = text;
		  }
		}

		nameList.push(player);
	  }
	  scope.tableHead = nameListColumn;
	  scope.tableContent = nameList;
	  scope.tableTitle = "nameList";
	  scope.tableFilename = nameListFile;
	});
  }

  /*****************************************************************************
   * 開いているリストをJSONファイルに保存する
   * 
   * @memberOf qFile
   * @param {object} scope - $scope
   ****************************************************************************/
  function saveJsonFile(scope) {
	var msg = "既にあるファイルを置き換えてもよろしいですか ?";
	var oldFile = scope.tableFilename;
	var newFile = scope.tableFilename.replace(/\.json/, "_" + dateString() + ".json");

	try {
	  fs.statSync(scope.tableFilename);
	  
	  //ファイルが存在する場合
	  confirm(msg, function() {
		fs.renameSync(oldFile, newFile);
		fs.writeFileSync(oldFile, JSON.stringify(scope.tableContent));
		cancelJsonFile(scope);
	  })

	  // ファイルが存在しない場合
	} catch (e) {
	  fs.writeFileSync(oldFile, JSON.stringify(scope.tableContent));
	  cancelJsonFile(scope);

	}

  }

  /*****************************************************************************
   * 開いているリストを閉じる
   * 
   * @memberOf qFile
   * @param {object} scope - $scope
   ****************************************************************************/
  function cancelJsonFile(scope) {
	scope.tableHead = null;
	scope.tableContent = null;
	scope.tableTitle = null;
	scope.tableFilename = null;
  }

  /*****************************************************************************
   * 日付のシリアル表現（yyyyMMddHHmmss）を返す
   * 
   * @memberOf qFile
   ****************************************************************************/
  function dateString() {
	return $filter('date')(new Date(), 'yyyyMMddHHmmss');
  }

  /*****************************************************************************
   * ツイート管理画面を開く
   * 
   * @memberOf qFile
   ****************************************************************************/
  function twitterWindowOpen() {
	$window.open("./twitter.html", "Twitter", twitterWindowParameter);
  }

  /*****************************************************************************
   * 確認用ウィンドウを開き、OKの場合のみ処理を実行する
   * 
   * @memberOf qFile
   * @param {string} msg - 確認用に表示するメッセージ
   * @param {object}() func - OKの場合実行する処理
   ****************************************************************************/
  function confirm(msg, func) {
	var modal = $uibModal.open({
	  templateUrl : "./template/confirm.html",
	  controller : "modal",
	  resolve : {
		myMsg : function() {
		  return {
			msg : msg
		  }
		}
	  }
	});

	modal.result.then(function() {
	  // OKの場合のみ実行
	  func();
	}, function() {
	});

  }

  /*****************************************************************************
   * ワーク用のフォルダを開く
   * 
   * @memberOf qFile
   ****************************************************************************/
  function openFolder() {
	shell.openItem(__dirname);
  }

  /*****************************************************************************
   * 参加者の招集
   * 
   * @memberOf qFile
   * @param {array} arr - 招集要項
   * @return {array} 参加者リスト
   ****************************************************************************/
  function callMember(arr) {
	var entryList = [];
	angular.forEach(arr, function(obj) {

	  // sourceが無い場合はプレイヤー自身とみなしてリストに追加
	  if (!obj.hasOwnProperty('source')) {
		entryList.push(angular.copy(obj));

		// sourceがある場合
	  } else {
		var subEntryList = [];

		// sourceが文字列指定の場合
		if (angular.isString(obj.source)) {
		  // nameListが指定されている場合
		  if (obj.source == "nameList") {
			console.log("callup by nameList");
			subEntryList = require(nameListFile);

			// ラウンド名が指定されている場合
		  } else {
			console.log("callup by " + obj.source);
			subEntryList = require("./history/current/" + obj.source + ".json").players;
			console.log(subEntryList);
		  }

		  // sourceがArrayで指定されている場合
		} else if (angular.isArray(obj.source)) {
		  console.log("callup by array");
		  subEntryList = callMember(obj.source);

		  // sourceがObjectで指定されている場合
		} else if (angular.isObject(obj.source)) {
		  console.log("callup by object");
		  subEntryList = callMember([ obj.source ]);
		}

		console.log(subEntryList);

		// filterが指定されている場合
		if (obj.hasOwnProperty('filter')) {
		  subEntryList = angular.copy(subEntryList).filter(function(o) {
			return ev(o[obj.filter.param], obj.filter.crit, obj.filter.oper);
		  });
		}

		// orderが指定されている場合
		if (obj.hasOwnProperty('order')) {
		  subEntryList.sort(sortFunc(obj.order));
		}

		// profileが指定されている場合
		if (obj.hasOwnProperty('profile')) {
		  subEntryList = angular.copy(subEntryList).map(function(o) {
			var o2 = {};
			angular.forEach(profiles, function(key) {
			  o2[key] = o[key];
			});
			return o2;
		  });
		}

		// propertyが指定されている場合
		if (obj.hasOwnProperty('property')) {
		  angular.forEach(obj.property, function(value, key) {
			console.log(value.length, subEntryList.length);
			for (var i = 0; i < value.length && i < subEntryList.length; i++) {
			  var player = subEntryList[i];
			  player[key] = value[i];
			  console.log(player, key, value, i, player[key]);
			}
		  })
		}

		console.log(subEntryList);

		angular.forEach(subEntryList, function(o) {
		  entryList.push(angular.copy(o));
		});
	  }
	});

	return entryList;

	// オペランドに応じた評価関数
	function ev(a, b, opr) {
	  switch (opr) {
	  case "==":
		return a == b;
		break;
	  case ">":
		return a > b;
		break;
	  case ">=":
		return a >= b;
		break;
	  case "<":
		return a < b;
		break;
	  case "<=":
		return a <= b;
		break;
	  case "<>":
		return a != b;
		break;
	  case "!=":
		return a != b;
		break;
	  }
	  return false;
	}

	// 並び替え用の関数
	function sortFunc(keys) {
	  return function(a, b) {

		for (var i = 0; i < keys.length; i++) {
		  var key = keys[i];
		  if (key.substring(0, 1) == "-") {
			var key2 = key.substring(1);
			if (a[key2] > b[key2]) {
			  return -1;
			}
			if (a[key2] < b[key2]) {
			  return 1;
			}
		  } else {
			if (a[key] > b[key]) {
			  return 1;
			}
			if (a[key] < b[key]) {
			  return -1;
			}
		  }
		}
		return 0;
	  }
	}
  }

  var qFile = {};
  qFile.rounds = rounds;
  qFile.initialize = initialize;
  qFile.openNameList = openNameList;
  qFile.saveJsonFile = saveJsonFile;
  qFile.cancelJsonFile = cancelJsonFile;
  qFile.twitterWindowOpen = twitterWindowOpen;
  qFile.openFolder = openFolder;
  return qFile;
} ]);
