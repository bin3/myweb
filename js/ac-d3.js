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
			return keys;
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
		};
		
		function nodeId(node) {
			return node.id + '-' + node.label;
		}
		function edge(src, tgt, type) {
			return {'source': nodeId(src), 'target': nodeId(tgt), 'type': type};
		}
		this.treeData = function() {
			function dfs(node, edges) {
				if (node.fail != root) {
					edges.push(edge(node, node.fail, 'fail'));
				}
				if (node.report) {
					edges.push(edge(node, node.report, 'report'));
				}
				var json = {'name': nodeId(node), 'children': []};
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

var tree = d3.layout.tree().size([ height - 20, width - 20]);

function clearTree(svg) {
	svg.selectAll('g.tree').remove();	
}

function drawTree(svg, json, edges) {
	clearTree(svg);
	
	var gtree = svg.append('g').attr('class', 'tree');
	var nodes = tree.nodes(json);
	// Normalize for fixed-depth.
	nodes.forEach(function(d) { d.y = radius + d.depth * level_height; });
	
//	console.log(nodes);
//	console.log(tree.links(nodes));
//	console.log(edges);
	
	var id2node = {};
	nodes.forEach(function(node) { id2node[node.name] = node; });
//	console.log(id2node);
	var links = gtree.selectAll("path.link").data(edges)
		.enter().append("path")
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
	
	var node = gtree.selectAll("g.node")
		.data(nodes, function(d) { return d.name; })
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	node.append("circle").attr("r", radius);

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
	
//	var g = svg.append('g').attr('class', 'tree');
	return svg;
}
	
$(document).ready(function(){
	console.log('AC demo started');

	var svg = initSvg();
	
//	$('#keys').val('abcd\nbc\n码农');
//	$('#text').val('码农啊abcd');
	$('#keys').val('abc\nbc\nb');
	$('#text').val('abcd');
	
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
	$('#gentree').click(function() {
		// debug
		$('#insert').click();
		$('#compile').click();
		
		var data = matcher.treeData();
		$('#graph-data').val(data.toSource());
		drawTree(svg, data.json, data.edges);
	});

	$('#gentrie').click(function() {
		$('#insert').click();
		$('#compile').click();
		
		var data = matcher.treeData();
		$('#graph-data').val(data.toSource());
		drawTree(svg, data.json, data.edges);
	});
	$('#clear').click(function() {
		matcher.clear();
		clearTree(svg);
	});
	
	// debug
	$('#gentree').click();

});