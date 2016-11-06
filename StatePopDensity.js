var width = 1500,
    height = 700;

var formatNumber = d3.format(",d");

var projection = d3.geo.albers()
			.center([0, 35.5175])
			.rotate([104, 0, 20])
			.parallels([35,37])
			.scale(9000)
			.translate([-width/2-800 , 650]);
			
		var path = d3.geo.path().projection(projection);
//var path = d3.geo.path()
//    .projection(null);//maybe do the projection here???

var color = d3.scale.threshold()
    .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
    .range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

var altColor = d3.scale.threshold()
    .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
    .range(["#EFFFDC", "#CAE9A3", "#BDE092", "#ACD67A", "#9AC765", "#8CBD52", "#74A935", "#589213", "#365F03"]);


// A position encoding for the key only.
var x = d3.scale.linear()
    .domain([0, 5100])
    .range([0, 480]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(13)
    .tickValues(color.domain())
    .tickFormat(function(d) { return d >= 100 ? formatNumber(d) : null; });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);





d3.json("tn.json", function(error, tn) {

  var countyLine = true;
  var tractLine = false;
  var stateLine = true;
  var colorOnOff = true;
  var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(440,40)");
    //.on("click",colorHelper);


g.selectAll("rect")
    .attr("class","scaleThingy")
    .data(color.range().map(function(d, i) {
      return {
        x0: i ? x(color.domain()[i - 1]) : x.range()[0],
        x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
        z: d
      };
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return d.x0; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    .style("fill", function(d) { return d.z; });

g.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", -6)
    .text("Population per square mile");    
    
  if (error) throw error;
  
    console.log(tn);
  var tracts  = topojson.feature(tn, tn.objects.tl_2013_47_tract);

  // Clip tracts to land.
  svg.append("defs").append("clipPath")
      .attr("id", "clip-land")
    .append("path")
      .datum(topojson.feature(tn, tn.objects.tl_2013_47_cousub))
      .attr("d", path);

  // Group tracts by color for faster rendering.
  svg.append("g")
      .attr("class", "tract")
      .attr("clip-path", "url(#clip-land)")
    .selectAll("path")
      .data(d3.nest()
        .key(function(d) { return color(d.properties.population / d.properties.area * 2.58999e6); })
        .entries(tracts.features.filter(function(d) { return d.properties.area; })))
    .enter().append("path")
      .style("fill", function(d) { return d.key; })
      .attr("d", function(d) { return path({type: "FeatureCollection", features: d.values}); });

  // Draw county borders.
  svg.append("path")
      .datum(topojson.mesh(tn, tn.objects.tl_2013_47_cousub, function(a, b) { return a !== b; }))
      .attr("class", "county-border")
      .attr("d", path);
    
  // Draw cesus tract borders.
//    
//  svg.append("path")
//      .datum(topojson.mesh(tn, tn.objects.tracts, function(a, b) { return a !== b; }))
//      .attr("class", "census-border")
//      .attr("d", path);



d3.select(self.frameElement).style("height", height + "px");

function changeMap(){
    
    if(!colorOnOff){//change the color of the scale
            g.selectAll(".scaleThingy")
            .data(altColor.range().map(function(d, i) {
              return {
                x0: i ? x(color.domain()[i - 1]) : x.range()[0],
                x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
                z: d
              };
            }))
            .enter().append("rect")
            .attr("height", 8)
            .attr("x", function(d) { return d.x0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .style("fill", function(d) { return d.z; });
        
            svg.append("g")
                  .attr("class", "tract")
                  .attr("clip-path", "url(#clip-land)")
                .selectAll("path")
                  .data(d3.nest()
                    .key(function(d) { return altColor(d.properties.population / d.properties.area * 2.58999e6); })
                    .entries(tracts.features.filter(function(d) { return d.properties.area; })))
                .enter().append("path")
                  .style("fill", function(d) { return d.key; })
                  .attr("d", function(d) { return path({type: "FeatureCollection", features: d.values}); });
    }else{//change the color back 
           g.selectAll(".scaleThingy")
                .data(color.range().map(function(d, i) {
                  return {
                    x0: i ? x(color.domain()[i - 1]) : x.range()[0],
                    x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
                    z: d
                  };
                }))
                .enter().append("rect")
                .attr("height", 8)
                .attr("x", function(d) { return d.x0; })
                .attr("width", function(d) { return d.x1 - d.x0; })
                .style("fill", function(d) { return d.z; });
        
            svg.append("g")
                  .attr("class", "tract")
                  .attr("clip-path", "url(#clip-land)")
                .selectAll("path")
                  .data(d3.nest()
                    .key(function(d) { return color(d.properties.population / d.properties.area * 2.58999e6); })
                    .entries(tracts.features.filter(function(d) { return d.properties.area; })))
                .enter().append("path")
                  .style("fill", function(d) { return d.key; })
                  .attr("d", function(d) { return path({type: "FeatureCollection", features: d.values}); });
                  // Draw county borders.

    }
    console.log(countyLine);
    if(countyLine){
        svg.append("path")
            .datum(topojson.mesh(tn, tn.objects.tl_2013_47_cousub, function(a, b) { return a !== b; }))
            .attr("class", "county-border")
            .attr("d", path);
        
    }
    if(tractLine){
        svg.append("path")
            .datum(topojson.mesh(tn, tn.objects.tl_2013_47_tract, function(a, b) { return a !== b; }))
            .attr("class", "census-border")
            .attr("d", path);
    }
    console.log("we in it"+colorOnOff);
}
    
    document.getElementById("button1").onclick = function(){colorOnOff = !colorOnOff
                                                           changeHelper();
                                                           };
    document.getElementById("button2").onclick = function(){tractLine= !tractLine
                                                           changeHelper();
                                                           };
    document.getElementById("button3").onclick = function(){countyLine = !countyLine
                                                           changeHelper();
                                                           };

    function changeHelper(){
        console.log("we on it");

        changeMap();
    }
    function tractLines(){

        
        console.log(tractLines);
    }
});
