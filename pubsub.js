
//--------------------------------------------------
//■Channelクラス

var Channel = function() {
	this.topics = [];
};

Channel.prototype.subscribe = function(topicName, subscriber) {
	if (this._contains(topicName) === false) {
		this.topics.push(new Topic(topicName));
	}
	var i = this._indexOf(topicName);
	this.topics[i].addSubscriber(subscriber);
};

Channel.prototype.unsubscribe = function(topicName, subscriber) {
	var i = this._indexOf(topicName);
	if (i >= 0) {
		this.topics[i].removeSubscriber(subscriber);
		if (this.topics[i].hasSubscribers() === false) {
			this._remove(i);
		}
	}
};

Channel.prototype._contains = function(topicName) {
	var i = this._indexOf(topicName);
	if (i >= 0) {
		return true;
	}
	return false;
};

Channel.prototype._indexOf = function(topicName) {
	var len = this.topics.length;
	for (var i = 0; i < len; i++) {
		if (this.topics[i].is(topicName)) {
			return i;
		}
	}
	return -1;
};

Channel.prototype._remove = function(i) {
	this.topics.splice(i, 1);
};


Channel.prototype.publish = function(topicName, options) {
	var i = this._indexOf(topicName);
	if (i >= 0) {
		this.topics[i].publish(options);
	}
};

Channel.prototype.__getTopics = function() {
	return this.topics;
};

/*
	//動作確認
	var View = function(viewName) {
		this.viewName = viewName;
	};
	View.prototype.onNotify = function(topicName) {
		console.log('View[' + this.viewName + ']にて、イベント[' + topicName + ']を受け取りました。');
	};
	var v1 = new View('v1');
	var v2 = new View('v2');
	var v3 = new View('v3');

	var channel = new Channel();
	var topicNames = ['jumped', 'beatedSlime', 'reachedTopFloor'];
	topicNames.forEach(function(v) {
		channel.subscribe(v, v1);
		channel.subscribe(v, v2);
		channel.subscribe(v, v3);
	});
	channel.unsubscribe('beatedSlime', v2);
	channel.__getTopics();

	channel.publish('jumped');
	channel.publish('beatedSlime');
	channel.publish('reachedTopFloor');
*/


//--------------------------------------------------
//■Topicクラス

var Topic = function(topicName) {
	this.topicName = topicName;
	this.subscribers = [];
};

Topic.prototype.addSubscriber = function(subscriber) {
	if (this._contains(subscriber)) {
		return;
	}
	this.subscribers.push(subscriber);
};

Topic.prototype.removeSubscriber = function(subscriber) {
	if (this._contains(subscriber) === false) {
		return;
	}
	this._remove(subscriber);
};

Topic.prototype._contains = function(subscriber) {
	var i = this.subscribers.indexOf(subscriber);
	if (i >= 0) {
		return true;
	}
	return false;
};

Topic.prototype._remove = function(subscriber) {
	var i = this.subscribers.indexOf(subscriber);
	if (i >= 0) {
		this.subscribers.splice(i, 1);
	}
};

Topic.prototype.is = function(topicName) {
	if (this.topicName === topicName) {
		return true;
	}
	return false;
};

Topic.prototype.hasSubscribers = function() {
	if (this.subscribers.length === 0) {
		return false;
	}
	return true;
};

Topic.prototype.__getSubscribers = function() {
	return this.subscribers;
};

Topic.prototype.publish = function(options) {
	//●現在、同期処理だが、setTimeoutすれば非同期にできる（Channel側でやっても良い）
	var self = this;
	this.subscribers.forEach(function(v) {
		v.onNotify(self.topicName, options);
	});
};


/*
	//動作確認
	var View = function(viewName) {
		this.viewName = viewName;
	};
	var v1 = new View('v1');
	var v2 = new View('v2');
	var v3 = new View('v3');

	var topic = new Topic('jumped');
	topic.addSubscriber(v1);
	topic.addSubscriber(v2);
	topic.addSubscriber(v3);
	topic.removeSubscriber(v2);
	topic.__getSubscribers();
*/

//--------------------------------------------------
