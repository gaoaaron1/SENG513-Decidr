import { Col, Container, Row } from "react-bootstrap";
import Timer from "./timer";
import { useState } from "react";

const View = ({ children }) => {
  const maxVotesPerPerson = 5;

  const [votes, setVotes] = useState(maxVotesPerPerson); //total votes a user is allowed ; this value will increment/decrement

  const votesLeft = 1; //actually do math here later

  const totalVotes = 25; //do actual math later

  return (
    <Container>
      <Row style={{ justifyContent: "center", textAlign: "center" }}>
        <h2>Where should we eat?</h2>
      </Row>
      <Row style={{ justifyContent: "flex-end", textAlign: "right" }}>
        <Col>
          <Timer />
        </Col>
      </Row>
      {children}
      <Row
        style={{
          textAlign: "center",
          justifyContent: "center",
          paddingTop: "50px",
        }}
      >
        <h3>
          You have {votesLeft}/{maxVotesPerPerson} votes left
        </h3>
        <button>&#x2b;</button>
      </Row>
    </Container>
  );
};

export default View;
