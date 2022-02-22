import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ReactGoogleSlides from "react-google-slides";
import RangeSlider from "react-bootstrap-range-slider";

import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { useAuth } from "../hooks/useAuth";
import { useFirebase } from "../hooks/useFirebase";

import { statusColors } from "../App";

//import "./Login.css";

const SlideShow = () => {
  return (
    <ReactGoogleSlides
      width={640}
      height={480}
      slidesLink="https://docs.google.com/presentation/d/1wBXffB8Jd3o-koVpv88amNpr02AeKDUQKel3SkYdIyY"
      slideDuration={0}
      position={1}
      loop
    />
  );
};

function Login({ bgColor, setBgColor }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [oldIncome, setOldIncome] = useState(0);
  const [income, setIncome] = useState(0);
  // const fb = useFirebase("V1LnaLArY0snQbr0ZDBh");
  const [stats, setStats] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const afterSignIn = location.state?.from.pathname ?? "/admin";
  const auth = useAuth();
  const eventId = "V1LnaLArY0snQbr0ZDBh";
  const userId = auth.user.uid;
  const fb = useFirebase(eventId, userId);
  useEffect(() => {
    setBgColor({
      color: statusColors.admin,
    });
  }, [setBgColor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    auth
      .signin(email, password)
      .then((r) => navigate(afterSignIn))
      .catch((e) => {
        console.log("errors", e.code);
        setError(e.code);
      });
  };

  useEffect(() => {
    if (!income) return null;
    const timeoutId = setTimeout(() => {
      const _oldIncome = oldIncome;
      setOldIncome(income);
      fb.incrementIncome({
        delta: income - _oldIncome,
        userId,
        eventId,
        income,
      }).then(() => console.log("income set"));
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [income]);

  useEffect(() => {
    console.log("get presence called");
    // fb.getPresence(eventId, userId);
    // fb.countPresence("eventid");
  }, []);

  return (
    <>
      <Container>
        {/*
        <h1>
          {fb.read().status} now online: {fb.countPresence()}
        </h1>
        <div className="display-1">{fb.read().income}</div>
        <div></div>
        <Button onClick={(e) => fb.setStatus("onboard", eventId)}>
          onboard
        </Button>
        <Button onClick={(e) => fb.setStatus("active", eventId)}>active</Button>
        <Button onClick={(e) => fb.setStatus("finished", eventId)}>
          finished
        </Button>
        <div className="text-center">{income}</div>
        <RangeSlider
          value={income}
          variant="light"
          onChange={(e) => setIncome(e.target.value)}
          size="lg"
          min={1500}
          max={13000}
          tooltip="off"
          step={10}
        />*/}
        <Row>
          <Col md={{ span: 4, offset: 4 }} className="mt-5">
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="mt-5">
              <FloatingLabel
                label="email"
                className="mb-3"
                controlId={"inputEmail"}>
                <Form.Control
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FloatingLabel>
              <FloatingLabel
                label="password"
                className="mb-3"
                controlId={"inputPassword"}>
                <Form.Control
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FloatingLabel>
              <Button variant="primary" type="Submit">
                Login
              </Button>{" "}
              <Button
                variant="link"
                onClick={() => {
                  setError("");
                  auth
                    .signout()
                    .then((r) => console.log("signout OK"))
                    .catch((e) => {
                      console.log("errors", e.code);
                      setError(e.code);
                    });
                }}>
                Signout{" "}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}
export default Login;
