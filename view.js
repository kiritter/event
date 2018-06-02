//簡易な構造とするため、Model兼Viewといった存在とする

//--------------------------------------------------
//■EventCounterViewクラス

var EventCounterView = function(channel) {
	this.channel = channel;

	this.jumpedCount = 0;
	this.beatedCount = 0;
	this.reachedCount = 0;

	//購読
	this._subscribe();

	//初期表示
	this._display();
};

EventCounterView.prototype._subscribe = function() {
	var self = this;
	var topicNames = ['jumped', 'beated', 'reached'];
	topicNames.forEach(function(v) {
		self.channel.subscribe(v, self);
	});
};

EventCounterView.prototype.onNotify = function(topicName) {

	switch (topicName) {
		case 'jumped':
			this.jumpedCount++;
			break;

		case 'beated':
			this.beatedCount++;
			break;

		case 'reached':
			this.reachedCount++;
			break;

		default:
			console.log('Not subscribe [' + topicName + ']');
	}

	this._display();
};

EventCounterView.prototype._display = function() {
	var target = $('#event-counter-view');
	target.find('.jumped').text(this.jumpedCount);
	target.find('.beated').text(this.beatedCount);
	target.find('.reached').text(this.reachedCount);
};


//--------------------------------------------------
//■CoinCounterViewクラス

var CoinCounterView = function(channel) {
	this.channel = channel;

	this.coinCount = 0;

	//購読
	this._subscribe();

	//初期表示
	this._display();
};

CoinCounterView.prototype._subscribe = function() {
	var self = this;
	var topicNames = ['jumped', 'beated', 'reached'];
	topicNames.forEach(function(v) {
		self.channel.subscribe(v, self);
	});
};

CoinCounterView.prototype.onNotify = function(topicName) {

	switch (topicName) {
		case 'jumped':
			this.coinCount += 1;
			break;

		case 'beated':
			this.coinCount += 2;
			break;

		case 'reached':
			this.coinCount += 5;
			break;

		default:
			console.log('Not subscribe [' + topicName + ']');
	}

	this._display();
};

CoinCounterView.prototype._display = function() {
	var target = $('#coin-counter-view');
	target.find('.coin-amount').text(this.coinCount);
};


//動的な購読のON/OFF
CoinCounterView.prototype.subscribe = function(topicName) {
	this.channel.subscribe(topicName, this);
};
CoinCounterView.prototype.unsubscribe = function(topicName) {
	this.channel.unsubscribe(topicName, this);
};


//--------------------------------------------------
//■SlimeCounterViewクラス

var SlimeCounterView = function(channel) {
	this.channel = channel;

	this.BEATED_COUNT_FOR_ONE_SLIME_POINT = 5;
	this.beatedCount = 0;
	this.slimePoint = 0;

	//購読
	this._subscribe();

	//初期表示
	this._display();
};

SlimeCounterView.prototype._subscribe = function() {
	var self = this;
	var topicNames = ['beated'];
	topicNames.forEach(function(v) {
		self.channel.subscribe(v, self);
	});
};

SlimeCounterView.prototype.onNotify = function(topicName) {

	switch (topicName) {
		case 'beated':
			this.beatedCount++;
			break;

		default:
			console.log('Not subscribe [' + topicName + ']');
	}

	this._calcSlimePoint();
	this._display();
};

SlimeCounterView.prototype._calcSlimePoint = function() {
	if (this.beatedCount % this.BEATED_COUNT_FOR_ONE_SLIME_POINT === 0) {
		this.slimePoint++;
	}
};

SlimeCounterView.prototype._display = function() {
	var target = $('#slime-counter-view');
	var pointArea = target.find('.slime-point-amount');
	var point = parseInt(pointArea.text(), 10);
	pointArea.text(this.slimePoint);

	if (this.slimePoint > 0 && this.slimePoint !== point) {
		var highlight = target.find('.slime-point');
		highlight.addClass('highlight');
		var timer = setTimeout(function() {
			highlight.removeClass('highlight');
			clearTimeout(timer);
		}, 350);
	}
};

//--------------------------------------------------
//■SlimeTimesCounterViewクラス

var SlimeTimesCounterView = function(channel) {
	this.channel = channel;

	this.TIMES_IN_A_ROW_FOR_JUMPED = 3;
	this.eventHistory = [];
	this.slimePoint = 0;

	//購読
	this._subscribe();

	//初期表示
	this._display();
};

SlimeTimesCounterView.prototype._subscribe = function() {
	var self = this;
	var topicNames = ['jumped', 'beated', 'reached'];
	topicNames.forEach(function(v) {
		self.channel.subscribe(v, self);
	});
};

SlimeTimesCounterView.prototype.onNotify = function(topicName) {

	switch (topicName) {
		case 'jumped':
		case 'reached':
			break;

		case 'beated':
			this._calcSlimePoint();
			break;

		default:
			console.log('Not subscribe [' + topicName + ']');
	}

	this._pushHistory(topicName);
	this._display();
};

SlimeTimesCounterView.prototype._pushHistory = function(topicName) {
	this.eventHistory.push(topicName);
	var len = this.eventHistory.length;
	if (len > this.TIMES_IN_A_ROW_FOR_JUMPED) {
		//先頭1件を削除して詰める
		this.eventHistory.shift();
	}
};

SlimeTimesCounterView.prototype._calcSlimePoint = function() {
	var len = this.eventHistory.length;
	for (var i = 0; i < this.TIMES_IN_A_ROW_FOR_JUMPED; i++) {
		var topicName = this.eventHistory[len - 1 - i];
		if (topicName !== 'jumped') {
			return;
		}
	}
	//直前が[this.TIMES_IN_A_ROW_FOR_JUMPED]回連続で'jumped'の場合、カウントアップ
	this.slimePoint++;
};

SlimeTimesCounterView.prototype._display = function() {
	var target = $('#slime-counter-view');
	var pointArea = target.find('.slime-times-point-amount');
	var point = parseInt(pointArea.text(), 10);
	pointArea.text(this.slimePoint);

	if (this.slimePoint > 0 && this.slimePoint !== point) {
		var highlight = target.find('.slime-times-point');
		highlight.addClass('highlight');
		var timer = setTimeout(function() {
			highlight.removeClass('highlight');
			clearTimeout(timer);
		}, 350);
	}
};


//--------------------------------------------------
//■SnsNotificationViewクラス

var SnsNotificationView = function(channel) {
	this.channel = channel;

	//表示分のデータを保持する設計にしても良いが、
	//今回は、データ保持せず、_display()内で見栄えのみ制御することにした

	//購読
	this._subscribe();

	//初期表示
	//なし
};

SnsNotificationView.prototype._subscribe = function() {
	var self = this;
	var topicNames = ['beated', 'reached'];
	topicNames.forEach(function(v) {
		self.channel.subscribe(v, self);
	});
};

SnsNotificationView.prototype.onNotify = function(topicName, options) {
	var text;

	switch (topicName) {
		case 'beated':
			text = 'スライムを倒しました！';
			break;

		case 'reached':
			text = '最上階に到達しました！';
			break;

		default:
			console.log('Not subscribe [' + topicName + ']');
	}

	var text1 = '○○さんが' + text;
	var text2 = 'at ' + DatetimeUtil.format(options['occurred_at']);
	this._display(text1, text2);
};

SnsNotificationView.prototype._display = function(text1, text2) {
	var MAX_ITEM_NUM = 5;
	var target = $('#sns-notification-view');
	var div1 = $('<div>').text(text1);
	var div2 = $('<div>').text(text2);
	div2.addClass('datetime');
	var li = $('<li>');
	li.append(div1);
	li.append(div2);
	li.addClass('sns-item');
	li.addClass('highlight');
	var ul = target.find('.sns-items');
	var lis = ul.find('li');
	//表示最大数を超えていたら最古を削除する
	var len = lis.length;
	if (len >= MAX_ITEM_NUM) {
		lis.last().remove();
	}
	//先頭に追加する
	ul.prepend(li);
	var timer = setTimeout(function() {
		li.removeClass('highlight');
		clearTimeout(timer);
	}, 350);
};


//動的な購読のON/OFF
SnsNotificationView.prototype.subscribe = function(topicName) {
	this.channel.subscribe(topicName, this);
};
SnsNotificationView.prototype.unsubscribe = function(topicName) {
	this.channel.unsubscribe(topicName, this);
};

//--------------------------------------------------
//■DatetimeUtilオブジェクト

var DatetimeUtil = {
	format: function(datetime) {
		var y = datetime.getFullYear();
		var M = this._paddingZero(datetime.getMonth() + 1);
		var d = this._paddingZero(datetime.getDate());
		var w = datetime.getDay();
		var wNames = ['日', '月', '火', '水', '木', '金', '土'];
		var h = this._paddingZero(datetime.getHours());
		var m = this._paddingZero(datetime.getMinutes());
		var s = this._paddingZero(datetime.getSeconds());
		return y + '/' + M + '/' + d + '(' + wNames[w] + ') ' + h + ':' + m + ':' + s;
	}
	, _paddingZero: function(num) {
		return ('0' + num).slice(-2);
	}
};
