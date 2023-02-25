// ==UserScript==
// @name            Chaturbetter
// @description     Chaturbetter adds to chaturbate all the features you've always dreamed of using a Tampermonkey script.
// @author          escargotbuffed
// @version         1.0.0
// @namespace       Chaturbetter
// @icon            https://www.chaturbate.com/favicon.ico
// @homepage        https://github.com/escargotbuffed/chaturbetter
// @updateURL       https://raw.githubusercontent.com/escargotbuffed/chaturbetter/master/Chaturbetter.user.js
// @downloadURL     https://raw.githubusercontent.com/escargotbuffed/chaturbetter/master/Chaturbetter.user.js

// @require         https://code.jquery.com/jquery-3.6.3.min.js
// @require         https://cdn.jsdelivr.net/npm/@violentmonkey/dom
// @match           https://*chaturbate.com/*
// @run-at          document-idle
// ==/UserScript==

/* global $, VM */

(() => {
  $(".refresh").append(
    '<div><p href="#" class="reset-grids" style="height: 6px;"> Number of columns:</p><select name="columns_number" id="id_columns_number"><option value="4">4 columns</option><option value="5">5 columns</option><option value="6" selected="">6 columns</option><option value="7">7 columns</option><option value="8">8 columns</option><option value="9">9 columns</option><option value="10">10 columns</option></select></div>'
  );

  $("#id_columns_number").change(() => {
	localStorage.setItem('grid-count', document.getElementById("id_columns_number").value);
	location.reload();
  });

  VM.observe(document.body, () => {
    // Change Layout
    function custom_layout(grid_count) {
      $("body .c-1").css({
        margin: "0 auto",
      });
      $("body")
        .find(".list li")
        .css({
          width: $("body .c-1").outerWidth() / grid_count - 15,
          height: "auto",
          maxHeight: `${170 + (11 - grid_count) * (3 * (12 - grid_count))}px`, // 4
          margin: "5px",
          overflow: "hidden"
        });
      $("body").find(".list img").css({
        width: "100%",
        height: "auto",
      });
    }

    var oldXHR = window.XMLHttpRequest;
    function newXHR() {
      var realXHR = new oldXHR();
      realXHR.addEventListener(
        "readystatechange",
        function () {
          if (realXHR.readyState == 4) {
            setTimeout(custom_layout, 400);
          }
        },
        false
      );
      return realXHR;
    }
    window.XMLHttpRequest = newXHR;

    const rooms = $(
      "#discover_root .room_list_room, #room_list .room_list_room, #broadcasters .room_list_room, .followedContainer .roomElement"
    );

	// On first run (or after clearing cache) sets the number of columns to the default html "selected" definition (currently it is 6)
	if (!localStorage.getItem("grid-count")) {
	localStorage.setItem('grid-count', document.getElementById("id_columns_number").value);
	}
	
	// if there's any room it sets the grid-count setting
    if (rooms.length > 0) {
      grids = localStorage.getItem('grid-count');
	  document.getElementById('id_columns_number').value = grids;
      custom_layout(grids);
      var grid_template_columns = "repeat(" + grids + ", 1fr)";
      $("#room_list").css({
        "grid-template-columns": grid_template_columns,
        "grid-template-rows": "auto",
        "grid-column-gap": "5px",
        "grid-row-gap": "15px",
        position: "relative",
        left: 0,
      }); // to be able to scale, on room list
      $("#room_list .room_list_room").css(
        "transition",
        "transform .1s ease-in-out"
      );
      $(".isIpad #room_list .room_list_room *, #broadcasters .room_list_room *")
        .css("user-select", "none")
        .css("-webkit-touch-callout", "none");

      $(rooms).each((index, element) => {
        // for each room
        let timer;
        const name = $(element).find("> a").data("room")
          ? $(element).find("> a").data("room")
          : $(element)
              .find("> .user-info > .username > a")
              .text()
              .replace(/^\s/g, "");
        const thumbnail = $(element).find("> a img");

        $(element)
          .bind("pointerdown", (event) => {
            element.releasePointerCapture(event.pointerId);
          })
          .bind("pointerenter", (event) => {
            // start
            var firstQ = $("body .c-1").innerWidth() / 5,
              lastQ = firstQ * 4,
              origin = "center center",
              originX = "center",
              originY = "center";
            if (event.pageX < firstQ) {
              originX = "left";
            } else if (event.pageX > lastQ) {
              originX = "right";
            }
            if (event.pageY < $(document).innerHeight() / 4) {
              originY = "top";
            } else if (event.pageY > $(document).innerHeight() / 4) {
              originY = "bottom";
            }
            origin = originX + " " + originY;

            if ($(element).parent("#room_list").length > 0) {
              // scale only on room list
              $(element)
                .css("transform-origin", origin)
                .css("transform", "translateX(0px) scale(1.5)")
                .css("z-index", "999");
            }

            timer = setInterval(
              () => {
                // animate thumbnail
                $(thumbnail).attr(
                  "src",
                  //`https://roomimg.stream.highwebmedia.com/riw/${name}.jpg?f=${Date.getTime().now()}`
                  `https://cbjpeg.stream.highwebmedia.com/minifwap/${name}.jpg?f=${Date.now()}`
                );
              }, 660
            );
          })
          .bind("pointerup pointerleave", (event) => {
            // stop
            if ($(element).parent("#room_list").length > 0) {
              // scale only on room list
              $(element)
                .css("transform-origin", "center center")
                .css("transform", "translateX(0px) scale(1)")
                .css("z-index", "0");
            }

            clearInterval(timer); // stop animate thumbnail
            timer = undefined;
          });
      });

      return false;
    }
  });
})();