/**
 * @author	<bensonzhang@gmail.com>
 * @date	2012-09-02
 */

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
		// for animation
		var bfs_nodes = [];
		var bfs_idx = -1;
		var text_ = '';
		var match_trace_ = [];
		var match_idx_ = -1;
		var match_keys_ = [];
		
		this.insert = function (key) {
//			console.log('insert key: ' + key);
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
			bfs_nodes = [];
			bfs_idx = -1;
			
			root.fail = root;
			var q = [root];
			while (q.length > 0) {
				var p = q.shift();
				for (var cl in p.children) {
					var child = p.children[cl];
					q.push(child);
					bfs_nodes.push(child);
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
		this.forwardCompile = function () {
			++bfs_idx;
			if (bfs_idx >= bfs_nodes.length) {
				bfs_idx = 0;
				$('path.fail').hide();
				$('path.report').hide();
				return;
			}
			for (; bfs_idx < bfs_nodes.length; ++bfs_idx) {
				var node = bfs_nodes[bfs_idx];
				if (node.fail != root) {
					$('#' + edgeId(node, node.fail, 'fail')).show('slow');
					if (node.report) {
						$('#' + edgeId(node, node.report, 'report')).show('slow');
					}
					break;
				}
			}
		};
		this.backCompile = function () {
			for (; bfs_idx >= 0; --bfs_idx) {
				var node = bfs_nodes[bfs_idx];
				if (node.fail != root) {
					$('#' + edgeId(node, node.fail, 'fail')).hide();
					if (node.report) {
						$('#' + edgeId(node, node.report, 'report')).hide();
					}
					--bfs_idx;
					break;
				}
			}
		};
		
		function matchTrace(tidx, node, nkeys) {
			return {'tidx': tidx, 'node': node, 'nkeys': nkeys};
		}
		function clearMathTrace() {
			clearMatchInfo(match_idx_);
			match_trace_ = [];
			match_idx_ = -1;
			match_keys_ = [];
		}
		this.match = function (text) {
			console.log('match text:' + text);
			clearMathTrace();
			text_ = text;
			
			var keys = [];
			var cur = root;
			for (var i = 0; i < text.length; ++i) {
				c = text[i];
				match_trace_.push(matchTrace(i, cur, keys.length));
				while (!(c in cur.children) && cur != root) {
					cur = cur.fail;
					match_trace_.push(matchTrace(i, cur, keys.length));
				}
				if (c in cur.children) {
					cur = cur.children[c];
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
			match_trace_.push(matchTrace(text.length, cur, keys.length));
			match_keys_ = keys;
			console.log(match_trace_);
			console.log(match_keys_);
			return keys;
		};
		function addClass(selector, cls) {
			var new_class = $(selector).attr('class') + ' ' + cls;
			$(selector).attr('class', new_class);
		}
		function removeClass(selector, cls) {
			var new_class = $(selector).attr('class').replace(cls, '');
			$(selector).attr('class', new_class);
		}
		function updateMatchInfo(match_idx) {
			console.log('match_idx=' + match_idx);
			if (match_idx < 0 || match_idx >= match_trace_.length) return;
			if (match_idx == 0) {
				$('#found-keys').val('');
			}
			var trace = match_trace_[match_idx];
			var ch = (trace.tidx < text_.length) ? text_[trace.tidx] : '';
			$('#match-info').text('[' + trace.tidx + '] ' + ch);
			var selector = '#' + nodeId(trace.node) + ' circle';
			addClass(selector, 'focus');
			// update Found Keys area
			var found_keys = '';
			for (var i = 0; i < trace.nkeys; ++i) {
				found_keys +=  match_keys_[i][0] + ', ' + match_keys_[i][1] + '\n';
			}
			$('#found-keys').val(found_keys);
		}
		function clearMatchInfo(match_idx) {
			if (match_idx < 0 || match_idx >= match_trace_.length) return;
			var trace = match_trace_[match_idx];
			$('#match-info').text('');
			var selector = '#' + nodeId(trace.node) + ' circle';
			removeClass(selector, 'focus');
		}
		this.forwardMatch = function() {
			clearMatchInfo(match_idx_);
			if ($('#text').val() != text_) {
				this.match($('#text').val());
			}
			++match_idx_;
			if (match_idx_ >= match_trace_.length) {
				match_idx_ = -1;
				return;
			}
			updateMatchInfo(match_idx_);
		};
		this.backMatch = function() {
			clearMatchInfo(match_idx_);
			if (match_idx_ < 0) return;
			--match_idx_;
			updateMatchInfo(match_idx_);
		};
		
		
		this.clear = function() {
			function dfs(p) {
				for (var cl in p.children) {
					dfs(p.children[cl]);
					p.children[cl] = null;
				}
			}
			dfs(root);
			root = null;
			id = 0;
			root = new balgo.ac.Node(id++, 'root');
			bfs_nodes = [];
			bfs_idx = -1;
		};
		
		function nodeId(node) {
			return 'node' + node.id;
		}
		function nodeName(node) {
			return node.id + '-' + node.label;
		}
		function edgeId(src, tgt, type) {
			return type + src.id + '-' + tgt.id;
		}
		function edge(src, tgt, type) {
			return {'source': nodeName(src), 'target': nodeName(tgt),
				'type': type, 'id': edgeId(src, tgt, type)};
		}
		this.treeData = function() {
			function dfs(node, edges) {
				if (node.fail != root) {
					edges.push(edge(node, node.fail, 'fail'));
				}
				if (node.report) {
					edges.push(edge(node, node.report, 'report'));
				}
				var json = {'id': nodeId(node), 'name': nodeName(node), 'final': node.final, 'children': []};
				for (var label in node.children) {
					child = node.children[label];
					edges.push(edge(node, child, 'normal'));
					var cjson = dfs(child, edges);
					json.children.push(cjson);
				}
				return json;
			}
			var edges = [];
			var json = dfs(root, edges);
			return {'json': json, 'edges': edges};
		};
	}
};

var width = 2000,
height = 1000;
var radius = 22;
var level_height = 100;
var duration = 1000;
var delay = 500;

var tree = d3.layout.tree().size([ height - 20, width - 20]);

function clearTree(svg) {
	svg.selectAll('g.tree').remove();	
}

function drawTrie(svg, json, edges) {
	clearTree(svg);
	
	var gtree = svg.append('g').attr('class', 'tree');
	var nodes = tree.nodes(json);
	// Normalize for fixed-depth.
	nodes.forEach(function(d) { d.y = 5 + radius + d.depth * level_height; });
	
	var id2node = {};
	nodes.forEach(function(node) { id2node[node.name] = node; });
	
	gtree.selectAll("path.link").data(edges)
		.enter().append("path")
		.attr("id", function(d) { return d.id; })
		.attr("class", function(d) { return "link " + d.type;})
	    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
	    .attr("d", function(d) {
	    	var src = id2node[d.source];
	    	var tgt = id2node[d.target];
	    	if (d.type == 'fail') {
	    		var dx = tgt.x - src.x,
	            dy = tgt.y - src.y,
	            dr = 2 * Math.sqrt(dx * dx + dy * dy);
	    		return "M" + src.x + "," + src.y + "A" + dr + "," + dr + " 0 0,1 " + tgt.x + "," + tgt.y;
	    	} else if (d.type == 'report') {
	    		var dx = tgt.x - src.x,
	            dy = tgt.y - src.y,
	            dr = 2 * Math.sqrt(dx * dx + dy * dy);
	    		return "M" + src.x + "," + src.y + "A" + dr + "," + dr + " 0 0,0 " + tgt.x + "," + tgt.y;
	    	}
	    	return "M" + src.x + "," + src.y + " L" + tgt.x + "," + tgt.y;
	  });
	
	// hide fail and report pointers at first
	$('path.fail').hide();
	$('path.report').hide();
	
	var node = gtree.selectAll("g.node")
		.data(nodes, function(d) { return d.name; })
		.enter().append("g")
		.attr("id", function(d) { return d.id; })
		.attr("class", 'node')
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	node.append("circle").attr("r", radius)
	.attr("class", function(d) {
		if (d.final) {
			return 'final';
		} else {
			return '';
		}
	});

	node.append("text").attr("dx", 0)
		.attr("dy", 4)
		.attr("text-anchor", function(d) { return "middle"; })
		.text(function(d) { return d.name; });
}

function initSvg() {
	var svg = d3.select("#graph").append("svg").attr("width", width).attr(
			"height", height);
	var defs = svg.append("g").attr("transform",
			"translate(0, 10)");
	
	// Per-type markers, as they don't inherit styles.
	defs.append("svg:defs").selectAll("marker")
	    .data(["normal", "fail", "report"])
	  .enter().append("svg:marker")
	    .attr("id", String)
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", radius * 1.6)
	    .attr("refY", 0)
	    .attr("markerWidth", 6)
	    .attr("markerHeight", 6)
	    .attr("orient", "auto")
	  .append("svg:path")
	    .attr("d", "M0,-5L10,0L0,5");
	return svg;
}
	
$(document).ready(function(){
	console.log('AC demo started');

	var svg = initSvg();
	var matcher = new balgo.ac.Matcher();

//	$('#keys').val('abc\nbc\nb');
//	$('#text').val('abcd');
	$('#keys').val('南京\n南京市\n南京市长\n市长\n江大桥\n长江\n大桥\n长江大桥');
	$('#text').val('南京市长江大桥');
	
	function clear() {
		matcher.clear();
		clearTree(svg);
	}
	function insert() {
		var text = $('#keys').val();
		var keys = text.split('\n');
		keys.forEach(matcher.insert);
	}
	
	$('#gentrie').click(function() {
		clear();
		insert();
		matcher.compile();
		
		var data = matcher.treeData();
		drawTrie(svg, data.json, data.edges);
	});
	$('#genall').click(function() {
		$('#gentrie').click();
		$('path.fail').show();
		$('path.report').show();
	});
	$('#toggle-fail').click(function() {
		$('path.fail').toggle();
	});
	$('#toggle-report').click(function() {
		$('path.report').toggle();
	});

	$('#match').click(function() {
		var text = $('#text').val();
		var keys = matcher.match(text);
		console.log(keys);
		var keystr = '';
		keys.forEach(function(key) { keystr += key.toString() + '\n'; });
		$('#found-keys').val(keystr);
	});
	$('#clear').click(function() {
		clear();
	});
	

	$('#forwardCompile').click(function() {
		matcher.forwardCompile();
	});
	$('#backCompile').click(function() {
		matcher.backCompile();
	});
	$('#forwardMatch').click(function() {
		matcher.forwardMatch();
	});
	$('#backMatch').click(function() {
		matcher.backMatch();
	});
	
	
	// debug
	$('#gentrie').click();

});