import Router from "next/router";
import { db } from "../../../config/firebase-config";

const deleteData = async (id) => {
  if (id) {
    const epics = await db
      .collection("Epics")
      .where("product_id", "==", id)
      .get();

    epics.docs.map((doc) => {
      db.collection("Epics").doc(doc.id).delete();
    });

    const kickoff = await db
      .collection("kickoff")
      .where("product_id", "==", id)
      .get();

    kickoff.docs.map((doc) => {
      db.collection("kickoff").doc(doc.id).delete();
    });

    const accessiblities = await db
      .collection("Accessibility")
      .where("product_id", "==", id)
      .get();

    accessiblities.docs.map((doc) => {
      db.collection("Accessibility").doc(doc.id).delete();
    });

    const challenges = await db
      .collection("Challenges")
      .where("product_id", "==", id)
      .get();

    challenges.docs.map((doc) => {
      db.collection("Challenges").doc(doc.id).delete();
    });

    const goals = await db
      .collection("Goals")
      .where("product_id", "==", id)
      .get();

    goals.docs.map(async (doc) => {
      const results = await db
        .collection("Result")
        .where("goal_id", "==", doc.id)
        .get();

      results.docs.map((doc) => {
        db.collection("Result").doc(doc.id).delete();
      });

      db.collection("Challenges").doc(doc.id).delete();
    });

    const visions = await db
      .collection("Visions")
      .where("product_id", "==", id)
      .get();

    visions.docs.map((doc) => {
      db.collection("Visions").doc(doc.id).delete();
    });

    const retrospectives = await db
      .collection("Retrospectives")
      .where("product_id", "==", id)
      .get();

    retrospectives.docs.map((doc) => {
      db.collection("Retrospectives").doc(doc.id).delete();
    });

    const huddles = await db
      .collection("Huddles")
      .where("product_id", "==", id)
      .get();

    huddles.docs.map((doc) => {
      db.collection("Huddles").doc(doc.id).delete();
    });

    const huddleBlockers = await db
      .collection("HuddleBlockers")
      .where("product_id", "==", id)
      .get();

    huddleBlockers.docs.map((doc) => {
      db.collection("HuddleBlockers").doc(doc.id).delete();
    });

    const tasks = await db
      .collection("tasks")
      .where("product_id", "==", id)
      .get();

    tasks.docs.map(async (doc) => {
      const comments = await db
        .collection("taskComments")
        .where("task_id", "==", doc.id)
        .get();

      comments.docs.map((doc) => {
        db.collection("taskComments").doc(doc.id).delete();
      });

      db.collection("tasks").doc(doc.id).delete();
    });

    const dialogues = await db
      .collection("Dialogues")
      .where("product_id", "==", id)
      .get();

    dialogues.docs.map((doc) => {
      db.collection("Dialogues").doc(doc.id).delete();
    });

    const journeys = await db
      .collection("Journeys")
      .where("product_id", "==", id)
      .get();

    journeys.docs.map(async (doc) => {
      const events = await db
        .collection("journeyEvents")
        .where("journey_id", "==", doc.id)
        .get();

      events.docs.map((doc) => {
        db.collection("journeyEvents").doc(doc.id).delete();
      });

      db.collection("Journeys").doc(doc.id).delete();
    });

    const learnings = await db
      .collection("Learnings")
      .where("product_id", "==", id)
      .get();

    learnings.docs.map((doc) => {
      db.collection("Learnings").doc(doc.id).delete();
    });

    const personas = await db
      .collection("Personas")
      .where("product_id", "==", id)
      .get();

    personas.docs.map((doc) => {
      db.collection("Personas").doc(doc.id).delete();
    });

    const teams = await db
      .collection("teams")
      .where("product_id", "==", id)
      .get();

    teams.docs.map((doc) => {
      db.collection("teams").doc(doc.id).delete();
    });

    const versions = await db
      .collection("versions")
      .where("product_id", "==", id)
      .get();

    versions.docs.map((doc) => {
      db.collection("versions").doc(doc.id).delete();
    });

    db.collection("Product").doc(id).delete()
    .then(() => Router.push("/product"))
  }
};

export default deleteData;
