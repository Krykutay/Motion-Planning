var camera, scene, renderer;
var geometry;
var material1 = new THREE.LineBasicMaterial( { color: 0xffffff } );
var material2 = new THREE.LineBasicMaterial( { color: 0xff0000 } );
var material3 = new THREE.LineBasicMaterial( { color: 0x00ffff } );
var material4 = new THREE.LineBasicMaterial( { color: 0x000000 } );
var material5 = new THREE.LineBasicMaterial( { color: 0x0000ff } );
var points = [];
var diagonals = [];
var angleDeg = [];
var first = false;
var last = false;
var obs = false;
var first_point;
var last_point;
var obs_points = [];
var frame_points = [];
var test_points = [];
var vertices = [];
var keepwhite = [];
var triangles;
var graphpoints = [];
var lasttri = [];
var lastgraph = [];
var adjlist = {};
var shortest_points = [];


init();
animate();


function init()
{
	mouse = new THREE.Vector3(0, 0, 0);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener('keydown', onDocumentKeyDown, false);
	window.addEventListener( 'resize', onWindowResize, false );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
	camera.position.z = 100;

	scene = new THREE.Scene();

	frame_points.push( new THREE.Vector3( - 50, -25, 0 ) );
	frame_points.push( new THREE.Vector3( -50, 35, 0 ) );
	frame_points.push( new THREE.Vector3( 50, 35, 0 ) );
	frame_points.push( new THREE.Vector3( 50, -25, 0 ) );
	frame_points.push( new THREE.Vector3( - 50, -25, 0 ) );
	DrawFrame();
	frame_points.pop();


	vertices[0] = [-50, -25];
	vertices[1] = [-50, 35];
	vertices[2] = [50, 35];
    vertices[3] = [50, -25];

    keepwhite[0] = [[-50, -25], [-50, 35]];
    keepwhite[1] = [[-50, 35], [50, 35]];
    keepwhite[2] = [[50, 35], [50, -25]];
    keepwhite[3] = [[50, -25], [-50, -25]];
    keepwhite[4] = [[-50, 35], [-50, -25]];
    keepwhite[5] = [[50, 35], [-50, 35]];
    keepwhite[6] = [[50, -25], [50, 35]];
    keepwhite[7] = [[-50, -25], [50, -25]];  

}



function onDocumentMouseDown( event ) {

    //event.preventDefault();
    
    switch ( event.which ) {
        case 1: // left mouse click
        var vec = new THREE.Vector3(); 
        var pos = new THREE.Vector3(); 

        vec.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1,
            0.5 );
        
        vec.unproject( camera );
        
        vec.sub( camera.position ).normalize();
        
        var distance = - camera.position.z / vec.z;
        
        pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );
		
		if (first){
            first_point = pos;
			DrawPoints(pos);
		}
		else if (last){
            last_point = pos;
			DrawPoints(pos);
			
			triangles = Delaunay.triangulate(vertices);


			for(i = triangles.length; i; ) {
                var j;
                var t1 = true, t2 = true, t3 = true;
                for (j = 0; j < keepwhite.length; j++){
                    if (keepwhite[j][0][0] == vertices[triangles[i-1]][0] &&
                        keepwhite[j][0][1] == vertices[triangles[i-1]][1] &&
                        keepwhite[j][1][0] == vertices[triangles[i-2]][0] &&
                        keepwhite[j][1][1] == vertices[triangles[i-2]][1]){
                            t1 = false;
                        }
                        

                    if (keepwhite[j][0][0] == vertices[triangles[i-2]][0] &&
                        keepwhite[j][0][1] == vertices[triangles[i-2]][1] &&
                        keepwhite[j][1][0] == vertices[triangles[i-3]][0] &&
                        keepwhite[j][1][1] == vertices[triangles[i-3]][1]){
                            t2 = false;
                        }

                    if (keepwhite[j][0][0] == vertices[triangles[i-3]][0] &&
                        keepwhite[j][0][1] == vertices[triangles[i-3]][1] &&
                        keepwhite[j][1][0] == vertices[triangles[i-1]][0] &&
                        keepwhite[j][1][1] == vertices[triangles[i-1]][1]){
                            t3 = false;
                        }
                }

                --i;
                if (t1){
                    test_points.push(new THREE.Vector2(vertices[triangles[i]][0], vertices[triangles[i]][1]));   
                }

                --i;
                if(t1 || t2){
                    test_points.push(new THREE.Vector2(vertices[triangles[i]][0], vertices[triangles[i]][1]));
                }

                if (!t2){
                    test_points.push(new THREE.Vector2(vertices[triangles[i+1]][0], vertices[triangles[i+1]][1]));
                }

                --i;
                if (t2 || t3){
                    test_points.push(new THREE.Vector2(vertices[triangles[i]][0], vertices[triangles[i]][1]));
                }
                if (!t3){
                    test_points.push(new THREE.Vector2(vertices[triangles[i+1]][0], vertices[triangles[i+1]][1]));
                }
                else{
                    test_points.push(new THREE.Vector2(vertices[triangles[i+2]][0], vertices[triangles[i+2]][1]));
                }
                DrawTriangle();

            }


		}
		else if (obs){
			
            vertices[vertices.length] = [pos.x, pos.y];

			DrawObs(pos);
		}
		

        break;

    }
  
}



function onDocumentKeyDown( event ){
    event.preventDefault();
	switch ( event.which ) {
        case 49: // if 1 is pressed
			first = true;
			last = false;
			obs = false;
        break;
		
        case 50: // if 2 is pressed
            var i;
            if (points.length > 0){
                for (i = 0; i < points.length-1; i++){
                    keepwhite[keepwhite.length] = [[points[i].x, points[i].y], [points[i+1].x, points[i+1].y]];

                    obs_points.push([new THREE.Vector2(points[i].x, points[i].y), new THREE.Vector2(points[i+1].x, points[i+1].y)]);
                }
                for (i = points.length-1; i >= 1; i--){
                    keepwhite[keepwhite.length] = [[points[i].x, points[i].y], [points[i-1].x, points[i-1].y]];
                }
            }
			points = [];
			first = false;
			last = false;
			obs = true;
        break;
		
        case 51: // if 3 is pressed
            var i;
            if (points.length > 0){
                for (i = 0; i < points.length-1; i++){
                    keepwhite[keepwhite.length] = [[points[i].x, points[i].y], [points[i+1].x, points[i+1].y]];

                    obs_points.push([new THREE.Vector2(points[i].x, points[i].y), new THREE.Vector2(points[i+1].x, points[i+1].y)]);
                }
                for (i = points.length-1; i >= 1; i--){
                    keepwhite[keepwhite.length] = [[points[i].x, points[i].y], [points[i-1].x, points[i-1].y]];
                }
            }
            points = [];
			first = false;
			last = true;
			obs = false;
        break;
        
        case 52: // if 4 is pressed
            var i;
            var t = -1;
            for(i = triangles.length; i; ) {
                t++;
                lasttri[t] = [];
                lastgraph[t] = [];
                var a1, a2, b1, b2, c1, c2, x1, x2, y1, y2, z1, z2, j, k;
                --i;
                a1 = vertices[triangles[i]][0];
                a2 = vertices[triangles[i]][1];
                --i;
                b1 = vertices[triangles[i]][0];
                b2 = vertices[triangles[i]][1];
                --i;
                c1 = vertices[triangles[i]][0];
                c2 = vertices[triangles[i]][1];

                lasttri[t].push(new THREE.Vector2(a1, a2));
                lasttri[t].push(new THREE.Vector2(b1, b2));
                lasttri[t].push(new THREE.Vector2(c1, c2));

                x1 = (a1+b1)/2;
                x2 = (a2+b2)/2;
                y1 = (a1+c1)/2;
                y2 = (a2+c2)/2;
                z1 = (b1+c1)/2;
                z2 = (b2+c2)/2;


                midtri = [];
                midtri.push(new THREE.Vector2( x1, x2 ));
                midtri.push(new THREE.Vector2( y1, y2 ));
                midtri.push(new THREE.Vector2( z1, z2 ));
                midtri.push(new THREE.Vector2( x1, x2 ));

                //DrawGraph(midtri);

                var m1 = true;
                var m2 = true
                var m3 = true;   
                var graphlines = [];             

                for(j = 0; j < obs_points.length; j++){

                    if( !isBetween(obs_points[j][0], obs_points[j][1], midtri[0]) &&
                        !isBetween(obs_points[j][0], obs_points[j][1], midtri[1]) &&
                        !doIntersect(midtri[0], midtri[1], obs_points[j][0], obs_points[j][1])
                        ){

                    }
                    else{
                        m1 = false;
                    }

                    if( !isBetween(obs_points[j][0], obs_points[j][1], midtri[0]) &&
                        !isBetween(obs_points[j][0], obs_points[j][1], midtri[2]) &&
                        !doIntersect(midtri[0], midtri[2], obs_points[j][0], obs_points[j][1])
                        ){
       
                    }
                    else{
                        m2 = false;
                    }

                    if( !isBetween(obs_points[j][0], obs_points[j][1], midtri[1]) &&
                        !isBetween(obs_points[j][0], obs_points[j][1], midtri[2]) &&
                        !doIntersect(midtri[1], midtri[2], obs_points[j][0], obs_points[j][1])
                        ){

                    }
                    else{
                        m3 = false;
                    }

                }
                var g0 = true; var g1 = true; var g2= true;
                if (m1){
                    graphlines = [];
                    graphlines.push(midtri[0]);
                    graphlines.push(midtri[1]);
                    DrawGraph(graphlines);

                    if(g0){
                        lastgraph[t].push(new THREE.Vector2(midtri[0].x, midtri[0].y));
                    }
                    if(g1){
                        lastgraph[t].push(new THREE.Vector2(midtri[1].x, midtri[1].y));
                    }
                    
                    g0 = false;
                    g1 = false;
                }
                if (m2){
                    graphlines = [];
                    graphlines.push(midtri[0]);
                    graphlines.push(midtri[2]);
                    DrawGraph(graphlines);
                    
                    if(g0){
                        lastgraph[t].push(new THREE.Vector2(midtri[0].x, midtri[0].y));
                    }
                    if(g2){
                        lastgraph[t].push(new THREE.Vector2(midtri[2].x, midtri[2].y));
                    }

                    g0 = false;
                    g2 = false;
                }
                if (m3){
                    graphlines = [];
                    graphlines.push(midtri[1]);
                    graphlines.push(midtri[2]);
                    DrawGraph(graphlines);
                    
                    if(g1){
                        lastgraph[t].push(new THREE.Vector2(midtri[1].x, midtri[1].y));
                    }
                    if(g2){
                        lastgraph[t].push(new THREE.Vector2(midtri[2].x, midtri[2].y));
                    }

                    g1 = false;
                    g2 = false;
                }


            }
        break;

        case 53: // if 5 is pressed

        var i, j;
        
        for(i = 0; i < lasttri.length; i++){
            var sp = -1; var lp = -1;
            if(isInside(lasttri[i][0].x, lasttri[i][0].y, lasttri[i][1].x, lasttri[i][1].y, lasttri[i][2].x, lasttri[i][2].y, first_point.x, first_point.y)){
                sp = i;
            }

            if(isInside(lasttri[i][0].x, lasttri[i][0].y, lasttri[i][1].x, lasttri[i][1].y, lasttri[i][2].x, lasttri[i][2].y, last_point.x, last_point.y)){
                lp = i;
            }
            

            leng = lastgraph[i].length;
            for(j = 0; j < leng; j++){
                var a, b, c;
                a = lastgraph[i][j];
                var list_a = [a.x, a.y];
                var list_b; var list_c;
                
                if (!(list_a in adjlist)){
                    adjlist[list_a] = {}; 
                }

                if (!("Start" in adjlist)){
                    adjlist["Start"] = {}; 
                }


                if(leng > 1){
                    b = lastgraph[i][(j+1) % lastgraph[i].length];
                    list_b = [b.x, b.y];
                    adjlist[list_a][list_b] = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
                }
                if(leng > 2){
                    c = lastgraph[i][(j+2) % lastgraph[i].length];
                    list_c = [c.x, c.y];
                    adjlist[list_a][list_c] = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2));
                }

                if(sp == i){
                    adjlist["Start"][list_a] = Math.sqrt(Math.pow(first_point.x - a.x, 2) + Math.pow(first_point.y - a.y, 2));
                }

                if(lp == i){
                    adjlist[list_a]["End"] = Math.sqrt(Math.pow(last_point.x - a.x, 2) + Math.pow(last_point.y - a.y, 2));
                }


            }

            if (sp == i){
                sp = -1;
            }

            if (lp == i){
                lp = -1;
            }


        }

        


        var graph = {};
        graph = {
            Start: adjlist["Start"],
            End: {},
        };

        for (var key in adjlist){
            //console.log( key );

            if (key == "Start" || key == "End"){
                continue;
            }

            graph[key] = adjlist[key];
        }
        
        console.log(graph);

        
        const shortestPath = findShortestPath(graph, 'Start', 'End');
        console.log(shortestPath);

        shortest_points.push(new THREE.Vector2(first_point.x, first_point.y));
        for (i = 1; i < shortestPath["path"].length-1; i++){

            
            const nums = shortestPath["path"][i].split(',')
            shortest_points.push(new THREE.Vector2(parseFloat(nums[0]), parseFloat(nums[1])));
        }
        shortest_points.push(new THREE.Vector2(last_point.x, last_point.y));

        DrawShortestPath(shortest_points);

        break;


    }
}


function area(x1, y1, x2, y2, x3, y3){
    return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
}

function isInside(x1, y1, x2, y2, x3, y3, x, y){
    var EPSILON = 1.0 / 1048576.0;

    // Calculate area of triangle ABC 
    var A = area (x1, y1, x2, y2, x3, y3);
  
    // Calculate area of triangle PBC  
    var A1 = area (x, y, x2, y2, x3, y3); 
      
    // Calculate area of triangle PAC  
    var A2 = area (x1, y1, x, y, x3, y3); 
      
    // Calculate area of triangle PAB  
    var A3 = area (x1, y1, x2, y2, x, y); 
      
    // Check if sum of A1, A2 and A3  
    // is same as A 

    var diff = A - A1 - A2 - A3;
    if(Math.abs(diff) < EPSILON){
        return true;
    }
    return false;
}



function onSegment(p, q, r){
    if ((q.x <= Math.max(p.x, r.x)) && (q.x >= Math.min(p.x, r.x)) && (q.y <= Math.max(p.y, r.y)) && (q.y >= Math.min(p.y, r.y)))
        return true;

    return false;
}

function orientationOfLines(p, q, r){

    var val = ((q.y - p.y) * (r.x - q.x)) - ((q.x - p.x) * (r.y - q.y));
    if (val > 0)
        return 1  //clockwise
    else if (val < 0)
        return 2  //counterclockwise
    else
        return 0  //colinear
}

function doIntersect(p1,q1,p2,q2){
      
    var o1 = orientationOfLines(p1, q1, p2) 
    var o2 = orientationOfLines(p1, q1, q2) 
    var o3 = orientationOfLines(p2, q2, p1) 
    var o4 = orientationOfLines(p2, q2, q1) 
  
    if ((o1 != o2) && (o3 != o4))
        return true
  
    // Special Cases 
  
    // p1 , q1 and p2 are colinear and p2 lies on segment p1q1 
    if ((o1 == 0) && onSegment(p1, p2, q1))
        return true
  
    // p1 , q1 and q2 are colinear and q2 lies on segment p1q1 
    if ((o2 == 0) && onSegment(p1, q2, q1))
        return true
  
    // p2 , q2 and p1 are colinear and p1 lies on segment p2q2 
    if ((o3 == 0) && onSegment(p2, p1, q2))
        return true
  
    // p2 , q2 and q1 are colinear and q1 lies on segment p2q2 
    if ((o4 == 0) && onSegment(p2, q1, q2))
        return true
  
    // If none of the cases 
    return false

}

function isBetween(a, b, c){
    var EPSILON = 1.0 / 1048576.0;
    var crossproduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y);
    if (Math.abs(crossproduct) > EPSILON){
        return false;
    }

    var dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y)*(b.y - a.y);
    if (dotproduct < 0){
        return false;
    } 

    var squaredlengthba = (b.x - a.x)*(b.x - a.x) + (b.y - a.y)*(b.y - a.y);
    if (dotproduct > squaredlengthba){
        return false;
    }

    return true;
           
}

function DrawTriangle(){

    geometry = new THREE.BufferGeometry().setFromPoints( test_points );

    var line = new THREE.Line( geometry, material2 );

    scene.add( line );

	test_points = []
}


function DrawFrame(){

    geometry = new THREE.BufferGeometry().setFromPoints( frame_points );

    var line = new THREE.Line( geometry, material1 );

    scene.add( line );
}

function DrawGraph(p){

    geometry = new THREE.BufferGeometry().setFromPoints( p );

    var line = new THREE.Line( geometry, material3 );

    scene.add( line );
}

function DrawShortestPath(p){

    geometry = new THREE.BufferGeometry().setFromPoints( p );

    var line = new THREE.Line( geometry, material5 );

    scene.add( line );
}


function DrawPoints(coord){
    geometry = new THREE.CircleGeometry( 0.5, 32 );
	var circle = new THREE.Mesh( geometry, material1 ); 
	circle.position.x = coord.x;
	circle.position.y = coord.y;

    scene.add( circle );
}

function DrawObs(coord){
    points.push( new THREE.Vector2( coord.x, coord.y ));

    geometry = new THREE.BufferGeometry().setFromPoints( points );

    var line = new THREE.Line( geometry, material1 );

    scene.add( line );
	DrawPoints(coord);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize( window.innerWidth, window.innerHeight );
  
  }


function animate() {

    requestAnimationFrame( animate );
    renderer.render( scene, camera );

}

