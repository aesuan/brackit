// The code in admin-candidate-setup.js handles what happens when the user clicks the "submit" button on the admin-candidate-setup page.

$(document).ready(function() {

  const candidates = [];

  $("#add-cand").on("click", function() {

    candidates.push($("#new-cand").val().trim());
    $("#new-cand").val("");

    $(".candidates").empty();

    for (let i = 0; i < candidates.length; i++) {
      let cand = $("<p>");
      cand.text(candidates[i]);
      $(".candidates").append(cand);
    }

    if (candidates.length === $(this).data("cand-num")) {
      $(this).removeClass("visible");
      $(this).addClass("invisible");
      $("#submit").removeClass("invisible");
      $("#submit").addClass("visible");
    }
  });

  // When user clicks "submit"
  $("#submit").on("click", function(event) {
    event.preventDefault();

    const BrackitId = $(this).data("brack-num");

    // Get the AdminId associated with our BrackitId
    $.get(`/api/brackits/${BrackitId}`)
      .then(function(data) {
        console.log("BRACKIT ID:", BrackitId);
        console.log(data);
        const adminCode = data.AdminId + "-" + BrackitId;
        console.log(adminCode);
        for (let i = 0; i < candidates.length; i++) {
          const newCandidate = {
          BrackitId: BrackitId,
          name: candidates[i]
          };
          // Post the candidates
          $.post("/api/candidates", newCandidate)
            // On success, run the following code 
            .then(function(data) {
              console.log("New Candidate:", data);
              if (i === candidates.length - 1) {
                $.get(`/create/codes/${BrackitId}/${adminCode}`);
              }
            });
        }
      });
  
  });

});
