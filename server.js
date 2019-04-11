const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");
const db = require("./app/models");
const routes = require("./app/controllers");

const PORT = process.env.PORT || 1234;

//body parser
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

//serves static versions of css & js so we can store as seperate files
app.use(express.static(path.join(__dirname, "app/public")));

//sets up handlebars
app.engine("handlebars", handlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

//sets view folder for handlebars
app.set("views", path.join(__dirname, "app/views"));

//points app to routes
app.use(routes);

//runs socket file
require("./app/controllers/socket.js")(io);

//syncs with sequelize/database and runs server
db.sequelize.sync({
    force: true
}).then(function () {


    //seeds
    const seed = async function () {
        const admin = await db.Admin.create({
            displayName: "Admin"
        });
        const adminId = admin.id;
        const adminName = admin.displayName;
        const bracket = await db.Brackit.create({
            name: "Question",
            numberCandidates: 4,
            AdminId: adminId
        });
        const bracketId = bracket.id;

        const user = await db.User.create({
            BrackitId: bracketId,
            displayName: adminName,
            isAdmin: true
        });

        const userId = user.id;

        const candidate = await db.Candidate.bulkCreate([{
            BrackitId: bracketId,
            name: "option 1",
            color: "purple"
        }, {
            BrackitId: bracketId,
            name: "option 2",
            color: "white"
        }, {
            BrackitId: bracketId,
            name: "option 3",
            color: "hello"
        }, {
            BrackitId: bracketId,
            name: "option 4",
            color: "red"
        }]);

        const matchup = await db.Matchup.bulkCreate([{
            CandidateId: candidate[0].id,
            roundNumber: 1,
            matchup: 1
        }, {
            CandidateId: candidate[1].id,
            roundNumber: 1,
            matchup: 1
        }, {
            CandidateId: candidate[2].id,
            roundNumber: 1,
            matchup: 2
        }, {
            CandidateId: candidate[3].id,
            roundNumber: 1,
            matchup: 2
        }])
        const votes = await db.Vote.bulkCreate([{
                UserId: userId,
                CandidateId: candidate[0].id,
                roundNumber: 1
            },
            {
                UserId: userId,
                CandidateId: candidate[3].id,
                roundNumber: 1
            }
        ])
    }

    seed().then(() => {
        let matchupNumber = 1;
        let roundNumber = 1;
        let bracketId = 1;

        db.sequelize.query(`SELECT matchup, roundNumber, brack.name "question", cand.name "candidateName", cand.id "candidateId", brack.id "brackitId" FROM Matchups mat INNER JOIN Candidates cand ON cand.id = mat.CandidateId INNER JOIN Brackits brack on brack.id = cand.BrackitId WHERE matchup=${matchupNumber} AND roundNumber=${roundNumber} AND brack.id=${bracketId};`, 
        {
            type: db.sequelize.QueryTypes.SELECT
        }).then((results, metadata) => {
            console.log(results);
        }).catch((error) => {
            console.log(error)
        })

        }
    );






    http.listen(PORT, function () {
        console.log(`App listening on http://localhost:${PORT}`)
    })
})