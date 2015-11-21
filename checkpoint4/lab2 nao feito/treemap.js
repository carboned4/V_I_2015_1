function treemap(){
     var width = 1000;
     var height = 1000;
     var margin = 15;
 
     var div = d3.select('#treemap').style('width', width)
                 .style('height', height).style('position', 'relative');
     var treeMap = d3.layout.treemap().size([width, height]);
 
    d3.json('data.json', function(error, data){
        var nodes = treeMap.nodes(data);
        div.selectAll('.node').data(nodes).enter()
           .append('div')
           .style('position', 'absolute')
           .style('left', function(d){return d.x + margin * d.depth})
           .style('top', function(d){return d.y + margin * d.depth})
           .style('width', function(d) { return d.dx - 2 * margin * d.depth } )
           .style('height', function(d) { return d.dy - 2 * margin * d.depth } )
           .style('background-color', function(d) {
               return $c.rgb2hex(150, 200, 200 - 50 * d.depth)
           })
           .style('border', '2px solid black')
           .text(function(d) { return d.t; });
    });
}


function pack() {
     var width = 1000;
     var height = 1000;
 
     var svg = d3.select('svg')
                 .attr('width', width).attr('height', height);
     var pack = d3.layout.pack().size([width, height]);
 
     d3.json('data.json', function(error, data){
        var nodes = pack.nodes(data);
        svg.selectAll('circle').data(nodes).enter().append('circle')
           .attr('cx', function(d) { return d.x })
           .attr('cy', function(d) { return d.y })
           .attr('r', function(d) { return d.r } )
           .attr('stroke', 'black')
           .attr('stroke-width', '1')
           .attr('fill', function(d) {
               return $c.rgb2hex(150, 200, 200 - 50 * d.depth)
           });
    });
}