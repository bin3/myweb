/**
 * @author	<bensonzhang@gmail.com>
 * @date	2012-09-02
 */

function log(msg) {
	var now = new Date();
	$('#log').append('[' + now.toLocaleString() + '] ' + msg + '<br/>');
}

balgo = function() {};
balgo.ac = {
	Node: function(id, label) {
		this.id = id;
		this.label = label;
		this.final = false;
		this.sibling = undefined;
		this.children = {};
		this.fail = undefined;
		this.report = undefined;
		this.key = undefined;
	},
	Edge: function(src, tgt, type) {
		this.src = src;
		this.tgt = tgt;
		this.type = type;
		this.w = 1.0;
	},
	Matcher: function() {
		var id = 0;
		var root = new balgo.ac.Node(id++, 'root');
		
		this.insert = function (key) {
			console.log('insert key: ' + key);
			var cur = root;
			for (var i = 0; i < key.length; ++i) {
				c = key[i];
				if (!cur.children[c]) {
					cur.children[c] = new balgo.ac.Node(id++, c);
				}
				cur = cur.children[c];
			}
			cur.final = true;
			cur.key = key;
		};
		
		this.compile = function () {
			console.log('compile');
			root.fail = root;
			var q = [root];
			while (q.length > 0) {
				var p = q.shift();
				for (var cl in p.children) {
					var child = p.children[cl];
					q.push(child);
					// find fail
					var cf = p.fail;
					if (p != root) {
						while (!(cl in cf.children) && cf != root) {
							cf = cf.fail;
						}
						if (cl in cf.children) {
							cf = cf.children[cl];
						}
					}
					child.fail = cf;
					
					// find report
					while (cf != root) {
						if (cf.final) {
							child.report = cf;
							break;
						}
						cf = cf.fail;
					}
				}
			}
		};
		
		this.match = function (text) {
			console.log('match key:' + text);
			var keys = [];
			var cur = root;
			for (var i = 0; i < text.length; ++i) {
				c = text[i];
				while (!(c in cur.children) && cur != root) {
					cur = cur.fail;
				}
				console.log('c=' + c + ', cur=');
				console.log(cur);
				if (c in cur.children) {
					cur = cur.children[c];
					console.log('[c in cur.children] cur=');
					console.log(cur);
					if (cur.final) {
						keys.push([cur.key, i]);
					}
					var rp = cur.report;
					while (rp) {
						keys.push([rp.key, i]);
						rp = rp.report;
					}
				}
			}
			return keys;
		};
		
		function dfs(node, nodes, edges) {
			nodes.push(node);
			if (node.fail != root) {
				edges.push(new balgo.ac.Edge(node, node.fail, 'fail'));
			}
			if (node.report) {
				edges.push(new balgo.ac.Edge(node, node.report, 'report'));
			}
			for (var label in node.children) {
				//console.log(label);
				child = node.children[label];
				edges.push(new balgo.ac.Edge(node, child, 'normal'));
				dfs(child, nodes, edges);
			}
		}
		function edgeAttr(edge) {
			var etype2attr = {
				'normal' : '',
				'fail' : 'style=dashed',
				'report' : 'color=green'
			};
			var attrs = [];
			attrs.push(etype2attr[edge.type]);
			return '[' + attrs.join(', ') + ']';	
		}
		function nodeAttr(node) {
			var attrs = [];
			attrs.push('label="#' + node.id + ' ' + node.label + '"');
			if (node.final) {
				attrs.push('shape = doublecircle');
			}
			return '[' + attrs.join(', ') + ']';
		}
		this.dot = function() {
			var nodes = [];
			var edges = [];
			dfs(root, nodes, edges);
			//console.log(edges);
			
			var s = 'digraph trie {\n';
			for (var i = 0; i < nodes.length; ++i) {
				var node = nodes[i];
				s += '\t' + node.id + nodeAttr(node) + ';\n';
			}
			for (var i = 0; i < edges.length; ++i) {
				var e = edges[i];
				s += '\t' + e.src.id + '->' + e.tgt.id + edgeAttr(e) + ';\n';
			}
			s += '}\n';
			//console.log(s);
			return s;
		};
	}
};

$(document).ready(function(){
	console.log('AC demo started');
	
	$('#keys').val('abcd\nbc\n码农');
	$('#text').val('码农啊abcd');
	
	//ac = new balgo.ac();
	//matcher = new ac.Matcher();
	matcher = new balgo.ac.Matcher();
	
	$('#insert').click(function() {
		var text = $('#keys').val();
		//console.log(text);
		var keys = text.split('\n');
		keys.forEach(matcher.insert);
	});
	$('#compile').click(function() {
		$('#insert').click();
		matcher.compile();
	});
	$('#match').click(function() {
		var text = $('#text').val();
		var keys = matcher.match(text);
		console.log(keys);
		var keystr = '';
		keys.forEach(function(key) { keystr += key.toString() + '\n'; });
		$('#found-keys').val(keystr);
	});
	$('#gendot').click(function() {
		var dot = matcher.dot();
		$('#dot').val(dot);
	});
});