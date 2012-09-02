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
		
		function nodeId(node) {
			return '#' + node.id + '-' + node.label;
		}
		this.toTreeJson = function() {
			function dfs(node) {
				var json = {'name': nodeId(node), 'children': []};
				for (var label in node.children) {
					child = node.children[label];
					var cjson = dfs(child);
					json.children.push(cjson);
				}
				return json;
			}
			var json = dfs(root);
			return json;
		};
		this.toForceData = function() {
			function edge(src, tgt, type) {
				return {'source': nodeId(src), 'target': nodeId(tgt), 'type': type};
			}
			function dfs(node, edges) {
				if (node.fail != root) {
					edges.push(edge(node, node.fail, 'fail'));
				}
				if (node.report) {
					edges.push(edge(node, node.report, 'report'));
				}
				for (var label in node.children) {
					child = node.children[label];
					edges.push(edge(node, child, 'normal'));
					dfs(child, edges);
				}
			}
			var edges = [];
			dfs(root, edges);
			console.log(edges);
			return edges;
		};
	}
};

var width = 960,
height = 500;

var tree = d3.layout.tree().size([ height - 20, width - 20]);
var diagonal = d3.svg.diagonal();

function drawTree(svg, json) {
	var nodes = tree.nodes(json);
	// Normalize for fixed-depth.
	nodes.forEach(function(d) { d.y = d.depth * 50; });

	var link = svg.selectAll("path.link").data(tree.links(nodes))
			.enter().append("path").attr("class", "link normal")
		    .attr("marker-end", function(d) { return "url(#normal)"; })
		    .attr("d", diagonal);

	var node = svg.selectAll("g.node")
		.data(nodes, function(d) { return d.name; })
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	node.append("circle").attr("r", 4.5);

	node.append("text").attr("dx", 5)
		.attr("dy", function(d) { return 3; })
		.attr("text-anchor", function(d) { return "start"; })
		.text(function(d) { return d.name; });
}

function drawForce(svg, links) {
	//sort links by source, then target
	links.sort(function(a,b) {
	    if (a.source > b.source) {return 1;}
	    else if (a.source < b.source) {return -1;}
	    else {
	        if (a.target > b.target) {return 1;}
	        if (a.target < b.target) {return -1;}
	        else {return 0;}
	    }
	});
	//any links with duplicate source and target get an incremented 'linknum'
	for (var i=0; i<links.length; i++) {
	    if (i != 0 &&
	        links[i].source == links[i-1].source &&
	        links[i].target == links[i-1].target) {
	            links[i].linknum = links[i-1].linknum + 1;
	        }
	    else {links[i].linknum = 1;};
	};

	var nodes = {};

	// Compute the distinct nodes from the links.
	links.forEach(function(link) {
	  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
	  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
	});

	var force = d3.layout.force()
	    .nodes(d3.values(nodes))
	    .links(links)
	    .size([width, height])
	    .linkDistance(60)
	    .charge(-300)
	    .on("tick", tick)
	    .start();

	var path = svg.append("svg:g").selectAll("path")
	    .data(force.links())
	  .enter().append("svg:path")
	    .attr("class", function(d) { return "link " + d.type; })
	    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

	var circle = svg.append("svg:g").selectAll("circle")
	    .data(force.nodes())
	  .enter().append("svg:circle")
	    .attr("r", 6)
	    .call(force.drag);

	var text = svg.append("svg:g").selectAll("g")
	    .data(force.nodes())
	  .enter().append("svg:g");

	// A copy of the text with a thick white stroke for legibility.
	text.append("svg:text")
	    .attr("x", 8)
	    .attr("y", ".31em")
	    .attr("class", "shadow")
	    .text(function(d) { return d.name; });

	text.append("svg:text")
	    .attr("x", 8)
	    .attr("y", ".31em")
	    .text(function(d) { return d.name; });

	// Use elliptical arc path segments to doubly-encode directionality.
	function tick() {
	  path.attr("d", function(d) {
	    var dx = d.target.x - d.source.x,
	        dy = d.target.y - d.source.y,
	        //dr = Math.sqrt(dx * dx + dy * dy);
	    	dr = 75/d.linknum;
	    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
	  });

	  circle.attr("transform", function(d) {
	    return "translate(" + d.x + "," + d.y + ")";
	  });

	  text.attr("transform", function(d) {
	    return "translate(" + d.x + "," + d.y + ")";
	  });
	}
}

function initSvg() {
	var svg = d3.select("#graph").append("svg").attr("width", width).attr(
			"height", height).append("g").attr("transform",
			"translate(0, 10)");
	
	// Per-type markers, as they don't inherit styles.
	svg.append("svg:defs").selectAll("marker")
	    .data(["normal", "fail", "report"])
	  .enter().append("svg:marker")
	    .attr("id", String)
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", 15)
	    .attr("refY", -1.5)
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
	$('#gentree').click(function() {
		var json = matcher.toTreeJson();
		$('#graph-data').val(json.toSource());
		drawTree(svg, json);
	});
	$('#genforce').click(function() {
		var data = matcher.toForceData();
		$('#graph-data').val(data.toSource());
		drawForce(svg, data);
	});

});