import React, { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
  useOutletContext,
} from "react-router-dom";

import Login from "./pages/Login";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Card from "react-bootstrap/Card";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Badge from "react-bootstrap/Badge";
import RangeSlider from "react-bootstrap-range-slider";

import QRCode from "react-qr-code";
import { useCountUp } from "react-countup";

import { FullScreen, useFullScreenHandle } from "react-full-screen";

import SocialIncomeLogo from "./logo-animated.svg";
import SocialIncomeLogoSmall from "./logo-small.svg";

import * as FirestoreService from "./services/firestore";
import { useFirebase } from "./hooks/useFirebase";
import { useAuth } from "./hooks/useAuth";

// INITIAL DATA
// const rootUrl = "http://192.168.1.47:3000/";
const rootUrl = "https://demoreact-c269a.web.app/";

const initialDataEvent = {
  title: "",
  name: "",
  date: "",
  where: "",
  description: "",
  lang: "en",
  currency: "CHF",
  host: "Sandino",
  hostemail: "sandino@socialincome.org",
  status: "draft",
  deleted: 0,
  min: 1500,
  max: 13000,
  slidesid: "1gZ3DnBr64tLc3zAFZ0897-D8whZ0wXGJZGvcLptcOsk",
};

export const statusColors = {
  draft: "var(--cucolor1l)",
  onboard: "var(--blue)",
  active: "var(--blue)",
  finished: "var(--cucolor4l)",
  admin: "var(--bs-gray-300)",
  initial: "white",
  dark: "var(--dark)",
  light: "var(--light)",
};

// Event listener hook
/*
// event listener hook
const useEventListener = (eventName, handler, element = window) => {
  const savedHandler = React.useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
};
*/

// APP
function App() {
  const [splashscreen, setSplashscreen] = useState(true);
  const [bgColor, setBgColor] = useState({});
  const [pageTitle, setPageTitle] = useState("");
  const bgColorProps = { bgColor, setBgColor, pageTitle, setPageTitle };

  const auth = useAuth();

  // AUTH LOGIC
  useEffect(() => {
    const user = auth.user;
    console.log("Auth logic reached");
    if (user == null) {
      console.log("loading...");
    } else {
      console.log("Auth Service returned something let's see...");
      if (user === false) {
        console.log("Oo this user is not logged in: make it ANON then");
        auth
          .anonsignin()
          .then((r) => console.log("anon signin response OK"))
          .catch((e) => console.log("errors", e.code));
      } else {
        setSplashscreen(false);
        if (user.isAnonymous) {
          console.log("Anonymous User");
        }
        if (!user.isAnonymous && user.email) {
          console.log("Admin User", user.email);
        }
      }
    }
  }, [auth]);

  const fullscreen = useFullScreenHandle();

  if (splashscreen) return <div className="splash" />;

  return (
    <FullScreen handle={fullscreen}>
      <div
        className="colorwrapper pb-5"
        style={{
          background: bgColor.color ?? statusColors.initial,
          color: bgColor.text ?? "var(--bs-dark)",
          transitionProperty: "background, color",
          transitionDuration: bgColor.time ?? "0s",
        }}>
        <Navbar bg="transparent">
          <Container>
            <div className="d-inline-flex align-items-center gap-2">
              <Navbar.Brand as={Link} to={auth.user.email ? "/admin" : "/"}>
                <img
                  alt=""
                  src={SocialIncomeLogo}
                  width="auto"
                  height="20"
                  className="d-none d-xl-inline-block"
                  style={{ marginTop: "-8px" }}
                />
                <img
                  alt=""
                  src={SocialIncomeLogoSmall}
                  width="auto"
                  height="31"
                  className="d-inline-block d-xl-none"
                />{" "}
              </Navbar.Brand>
              <span className="fw-bold text-reset">{pageTitle}</span>
            </div>
          </Container>
        </Navbar>
        <Container>
          <Routes>
            <Route
              path="/:eventName"
              element={<ShowEvent {...bgColorProps} end />}
            />
            <Route
              path="/e/:eventId"
              element={<ShowEvent {...bgColorProps} end />}
            />
            <Route path="/login" element={<Login {...bgColorProps} />} />
            <Route path="/admin" element={<Admin />}>
              <Route index element={<Dashboard {...bgColorProps} />} />
              <Route
                path="events/list"
                element={<EventsList {...bgColorProps} />}
              />
              <Route
                path="events/:eventId"
                element={<EventAdmin {...bgColorProps} />}>
                <Route path="edit" element={<EditEvent {...bgColorProps} />} />
                <Route
                  path="presenter"
                  element={<Presenter {...{ ...bgColorProps, fullscreen }} />}
                />
                <Route path="remote" element={<Remote {...bgColorProps} />} />
                <Route
                  path="delete"
                  element={<EventDelete {...bgColorProps} />}
                />
              </Route>
              <Route
                path="users"
                element={<UsersList {...bgColorProps} />}></Route>
            </Route>
            <Route index element={<Home />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
      </div>
      <div className="pt-2 pb-5 bg-dark text-light">
        <Container>
          <Row>
            <Col>
              <div className="small text-muted">
                {auth.user?.uid} | {auth.user?.email} |{" "}
              </div>
            </Col>
            <Col>
              {auth.user?.email ? (
                <Button
                  variant="link"
                  size="sm"
                  className="text-reset"
                  onClick={(e) => {
                    auth.signout();
                  }}>
                  Sign out
                </Button>
              ) : (
                <Link
                  className="text-reset text-muted small text-decoration-none"
                  to="/admin">
                  Admin
                </Link>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </FullScreen>
  );
}

function Home() {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventName) return null;

    FirestoreService.getEventId(eventName)
      .then((doc) => {
        if (doc.docs.length > 0) {
          navigate("/e/" + doc.docs[0].id);
        } else {
          setErrorMsg("no event with this name");
        }
      })
      .catch((e) => console.log("error getting event id", e.message));
  };

  const handleChange = (e) => {
    setEventName(e.target.value.trim().toLowerCase());
    setErrorMsg("");
  };
  return (
    <>
      <div className="mt-5 px-4 py-5">
        <h1 className="display-4" style={{ fontWeight: 800 }}>
          How many people can you lift out of poverty with 1% of your income?
        </h1>
        <p className="lead">
          Enter the event and alltogether enter your monthly income to calculate
          your impact.
        </p>
        <hr className="my-5" />

        <div>
          <Form onSubmit={handleSubmit}>
            <Form.Group as={Row} className="mb-3" controlId="urlField">
              <Col sm={6}>
                <Form.Control
                  type="text"
                  name="eventcode"
                  placeholder="Event Name or ID"
                  size="lg"
                  onChange={handleChange}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="off"
                />
                <Form.Text id="passwordHelpBlock" muted>
                  {errorMsg}
                </Form.Text>
              </Col>
              <Col>
                <Button size="lg" type="submit">
                  Join now
                </Button>
              </Col>
            </Form.Group>
          </Form>
        </div>
      </div>
    </>
  );
}
// *****
// EVENT USER VIEW
function ShowEvent({ bgColor, setBgColor, pageTitle, setPageTitle }) {
  let navigate = useNavigate();
  const params = useParams();
  const [event, setEvent] = useState();
  const [eventId, setEventId] = useState(params.eventId);

  const [income, setIncome] = useState(0);
  const auth = useAuth();
  const userId = auth.user.uid;

  const fb = useFirebase(params.eventId, userId);
  const _data = fb.read();
  const _nowOnline = fb.countPresence();
  const userInitialIncome = fb.getUserIncome();
  const [oldIncome, setOldIncome] = useState(userInitialIncome);

  const panelProps = { event, income, setIncome, userId };

  // SAVE STATS BACKGROUND
  useEffect(() => {
    if (!event) return;
    setBgColor({
      color: statusColors[event.status] ?? statusColors.initial,
      text: event.status === "active" ? statusColors.light : statusColors.dark,
      time: "1.5s",
    });
    setPageTitle(event.title);
    return () => setPageTitle("");
  }, [event, setBgColor, setPageTitle]);

  // GET EVENT BY NAME
  useEffect(() => {
    console.log("first load called");
    if (event) return null;
    console.log("hey, doing something wrong first load  ?");
    // by event name
    if (params.eventName) {
      FirestoreService.getOnceBy("events", "name", params.eventName)
        .then((doc) => {
          if (doc.docs.length > 0) {
            let _doc = doc.docs[0];
            // setEvent({ ..._doc.data(), id: _doc.id });
            setEventId(_doc.id);
          } else {
            navigate("/");
          }
        })
        .catch((e) => console.log("error getting event id", e.message));
    }
  }, [params, event, navigate]);

  // LOAD EVENT
  useEffect(() => {
    console.log("initial income", userInitialIncome);
    if (!eventId || event) return null;
    console.log("hey, doing something wrong streamer  ?");
    FirestoreService.getOnce(eventId, "events")
      .then((doc) => {
        console.log("streaming action", doc.data());
        setEvent({ id: doc.id, ...doc.data() });
        setOldIncome(userInitialIncome);
      })
      .catch((error) => console.log("streaming error", error.message));
  }, [eventId]);

  // STREAM EVENT DATA

  // debounce input and auto send

  /*
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (income > 100) {
        const colRef = `events/${eventId}/incomes`;
        FirestoreService.write(userId, colRef, { income }, userId)
          .then(() => console.log("income saved all good"))
          .catch((e) => console.log("error saving income ", e.message));
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [income]);
*/

  useEffect(() => {
    if (!income) return null;
    const timeoutId = setTimeout(() => {
      const _oldIncome = oldIncome || userInitialIncome || 0;
      console.log("old", oldIncome, userInitialIncome, _oldIncome);
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

  if (!event) return <Loading />;

  return (
    <>
      <div className="text-center my-2 py-2">
        {_nowOnline > 1 ? (
          <>
            <strong>{_nowOnline} users</strong> now online
          </>
        ) : (
          `You're all alone here`
        )}
      </div>
      {event.status === "active" && <PanelActive {...panelProps} />}
      {event.status === "onboard" && <PanelOnboard {...panelProps} />}
      {event.status === "draft" && <PanelDraft {...panelProps} />}
      {event.status === "finished" && <PanelFinished {...panelProps} />}
    </>
  );
}
function PanelDraft({ event }) {
  return (
    <div className="p-5 mt-5 text-center">
      <h3 className="display-1 mt-5">Draft</h3>
      <span>We're preparing a wonderfull event</span>
    </div>
  );
}
function PanelOnboard({ event }) {
  return (
    <div className="p-5 mt-5 text-center">
      <h2>{event.title}</h2>
      <div className="d-flex align-items-center justify-content-center gap-2 small">
        <span>Event ID:</span>
        <Link as="a" className="text-reset" to={"/e/" + event.id}>
          {event.name}
        </Link>
      </div>
      <h3 className="display-1 mt-5">Welcome on Board</h3>
      <span>Ready to help out ?</span>
    </div>
  );
}
function PanelFinished({ event, income }) {
  return (
    <div className="p-5 mt-5 text-center">
      <h3 className="display-1 mt-5">The Event is finished</h3>
      <span>Let's keep in touch </span>
      <div className="mb-5">
        <a
          href={
            "https://socialincome.org/get-involved-individual?currency=" +
            event.currency +
            "&salary=" +
            income
          }
          className="btn btn-lg btn-primary"
          target="_blank"
          rel="noreferrer">
          {income / 100}/mo Let's do it
        </a>
      </div>
    </div>
  );
}
function PanelActive({ event, income, setIncome, userId, oldIncome }) {
  /*
  const eventId = event.id;
  const [oldIncome, setOldIncome] = useState(0);
  const [income, setIncome] = useState(0);
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
*/
  return (
    <div
      className="px-3 mx-auto mt-5 text-center"
      style={{ maxWidth: "450px" }}>
      {/*
      <div className="d-none mt-4 p-5 bg-light text-dark rounded-lg">
        <div className="mb-5 fs-3">
          <span>Your monthly income</span>
          <br />
          <span className="display-1 fw-bolder">{income}</span>
          <span> {event.currency}</span>
        </div>

        <div>
          <span>would help support</span>
          <br />
          <span className="display-4 fontWeight-bolder">
            {Math.round(income / 100)}
          </span>
          <span> {event.currency}</span>
        </div>
  </div>
  */}
      <svg
        viewBox="0 0 282 282"
        fill="none"
        preserveAspectRatio="xMinYMin meet">
        <g>
          <rect width="282" height="282" rx="25" fill="#EDF3FF" />
          <text width="282" height="282" fill="var(--blue)">
            <tspan x="210" y="213.102">
              {event.currency}
            </tspan>
            <tspan x="210" y="113.102">
              {event.currency}
            </tspan>
            <tspan
              fontSize="64px"
              fontWeight={800}
              x="205"
              y="113.406"
              textAnchor="end"
              letterSpacing={-1}>
              {income}
            </tspan>
            <tspan x="205" y="214.305" fontSize="48px" textAnchor="end">
              {Math.round(income / 100)}
            </tspan>
            <tspan
              x="141"
              y="43.3359"
              textAnchor="middle"
              fontWeight={600}
              fontSize="24px"
              letterSpacing={-1}>
              Your monthly income
            </tspan>
            <tspan x="141" y="174.785" textAnchor="middle">
              would held support
            </tspan>
          </text>
        </g>
      </svg>

      <div>
        <div className="mt-3 px-4">
          <span className="small">
            Use slider to adjust your monthly income
          </span>
          <RangeSlider
            value={income}
            //variant="light"
            onChange={(e) => setIncome(e.target.value)}
            size="lg"
            min={parseInt(event.min) || 1500}
            max={parseInt(event.max) || 13000}
            tooltip="off"
            step={10}
            className="rangeslider"
          />
        </div>
      </div>
    </div>
  );
}

// ****
// LIST EVENTS
function EventsList({ bgColor, setBgColor }) {
  const navigate = useNavigate();
  const [eventList, setEventList] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [error, setError] = useState();
  const [userId, userEmail] = useOutletContext();

  useEffect(() => {
    setBgColor({
      color: statusColors.admin,
    });
  }, [setBgColor]);

  useEffect(() => {
    FirestoreService.getEventList()
      .then((list) => {
        let eventData = [];
        list.forEach((doc) => {
          eventData = [...eventData, { id: doc.id, ...doc.data() }];
        });
        setEventList(eventData);
      })
      .catch((e) => setError("promise not resolved", e.code));
  }, []);

  // CREATE EVENT --> rewrite  ?
  function createEvent() {
    FirestoreService.add("events", initialDataEvent, userId)
      //FirestoreService.createEvent(initialDataEvent, userId)
      .then((doc) => {
        console.log("fucking create", doc);
        navigate(`/admin/events/${doc.id}/edit`);
      })
      .catch((e) => console.log("error adding list", e.message));
  }
  // unused component eventlist > td
  /*
  const eventListItems = eventList.map((event, i) => (
    <tr key={i} className="align-middle">
      <td>{i}</td>
      <td>{event.title}</td>
      <td>
        <small>{event.url}</small>
      </td>
      <td className="d-flex justify-content-end gap-2">
        {[
          { variant: "warning", to: "remote/", icon: "podcast" },
          { variant: "warning", to: "presenter/", icon: "eye" },
          { variant: "secondary", to: "event/", icon: "edit" },
        ].map((el, idx) => {
          return (
            <Button
              key={idx}
              variant={`outline-${el.variant}`}
              size="sm"
              as={Link}
              to={el.to + event.id}>
              <i className={`fa fa-${el.icon}`}></i>
            </Button>
          );
        })}
      </td>
    </tr>
  ));
  */

  return (
    <>
      <div className="d-flex flex-wrap align-items-center mt-2 gap-2">
        <h2 className="text-nobreak">Events</h2>
        <div className="flex-grow-1"></div>
      </div>
      <Row className="sticky-top py-3">
        <Col xs={8} lg={6} className="d-flex gap-2">
          <Form.Control
            type="text"
            size="lg"
            onChange={(e) => setFilterList(e.target.value.toLowerCase())}
            value={filterList}
            className="shadow"
            placeholder="Search event or status"
          />
          <Button
            variant="outline-secondary"
            className="shadow"
            size="lg"
            onClick={() => setFilterList("")}>
            <i className="fa fa-close"></i>
          </Button>
        </Col>
        <Col className=" d-flex justify-content-end">
          <Button onClick={createEvent} className="shadow">
            <i className="fa fa-plus"></i> Event
          </Button>
        </Col>
      </Row>
      {/*CARDS DISPLAY*/}
      <Row xs={1} md={3} className="g-3 mt-2 d-flex">
        {eventList
          .filter(
            (el) =>
              el.title.toLowerCase().includes(filterList) ||
              el.status.includes(filterList)
          )
          .map((event, idx) => (
            <Col className="d-flex align-content-stretch" key={idx}>
              <Card
                bg="light"
                text="dark"
                className="g-3 border-0 shadow-sm w-100">
                <Card.Body>
                  <Card.Title className="fs-5 fw-bolder">
                    {event.title}{" "}
                  </Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {event.name}
                  </Card.Subtitle>
                  <Card.Subtitle className="mb-2 text-muted small">
                    {event.date ?? "19.12.2022"}
                  </Card.Subtitle>
                </Card.Body>
                <Card.Footer className="text-muted bg-light d-flex justify-content-end  align-items-center gap-2">
                  <div className="flex-grow-1">
                    <Badge bg="secondary">{event.status}</Badge>
                  </div>
                  <ActionButtons eventId={event.id} />
                </Card.Footer>
              </Card>
            </Col>
          ))}
      </Row>

      {""}
      {error}
    </>
  );
  /*}
      <div className="mt-3 p-2 bg-light rounded-2">
        <Table hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>URL</th>
              <th className="d-flex justify-content-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {eventList.length > 0 ? (
              eventListItems
            ) : (
              <tr>
                <td colSpan={4}>
                  <Loading label="Loading Event List" mh="200px" />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
            {*/
}

// ****
// EDIT EVENT
function EditEvent({ bgColor, setBgColor }) {
  const [event, updateEvent, userId] = useOutletContext();
  const [autoSaveStatus, setautoSaveStatus] = useState("Autosave On");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setBgColor({
      color: statusColors.admin,
    });
  }, [setBgColor]);

  // something is wrong by auto saving the docs. to many reads !!
  useEffect(() => {
    console.log("something changed", isDirty);
    if (!isDirty) return null;
    setautoSaveStatus("Unsaved");
    const timeoutId = setTimeout(() => {
      setautoSaveStatus("Saving... ");
      updateEvent({ ...event });
      setIsDirty(false);
      let now = new Date();

      setautoSaveStatus("Saved! " + now.getHours() + ":" + now.getMinutes());
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [event]);

  // returns
  if (!event) return <Loading label="Loading Event" />;

  return (
    <>
      <AdminHeader status buttons {...{ event, msg: autoSaveStatus }} />
      <Row className="mt-3">
        <Col md={8}>
          <EditForm {...{ setIsDirty, isDirty }} />
        </Col>
        <Col md={4}>
          <div className="mb-3 px-3 small">
            <div>
              <EditEventInfo {...{ setIsDirty, isDirty }} />
            </div>
          </div>
          <div className="my-3 px-3 ">
            <EditSelectForm {...{ setIsDirty, isDirty }} />
          </div>
        </Col>
      </Row>
    </>
  );
}
function EditForm({ setIsDirty, isDirty }) {
  const [event, setEvent, userId] = useOutletContext();

  const fieldList =
    "title,name,date,where,description,hr,host,hostemail,hr,min,max,hr,slidesid";
  // Form logique

  const handleSubmit = (e) => {
    e.preventDefault();
    return null;
  };

  const handleChange = (e) => {
    if (!isDirty) {
      setIsDirty(true);
    }
    setEvent({
      ...event,
      [e.target.name]: e.target.value.trim(),
    });
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        {fieldList.split(",").map((field, index) => {
          if (field === "hr") return <hr key={field + index} />;
          return (
            <FloatingLabel
              label={field}
              className="mb-3"
              controlId={"inputField" + field}
              key={field + index}>
              <Form.Control
                type="text"
                name={field}
                placeholder={field}
                defaultValue={event[field] || ""}
                onBlur={handleChange}
              />
            </FloatingLabel>
          );
        })}
        <Button as={Link} to="/admin" variant="outline-secondary" type="button">
          Close
        </Button>{" "}
        <Button variant="primary" type="Submit">
          Save
        </Button>
      </Form>
    </div>
  );
}
function EditSelectForm({ setIsDirty, isDirty }) {
  const [event, setEvent] = useOutletContext();

  const handleChange = (e) => {
    if (!isDirty) setIsDirty(true);
    setEvent({ ...event, [e.target.name]: e.target.value });
  };
  return (
    <>
      <Form.Select
        value={event.status}
        className="bg-transparent border-dark"
        onChange={handleChange}
        name="status">
        <option>Status</option>
        <option value="draft">Draft</option>
        <option value="onboard">Onboard</option>
        <option value="active">Active</option>
        <option value="finished">Finished</option>
        <option value="archive">Archive</option>
      </Form.Select>
      <br />
      <Form.Select
        value={event.currency}
        className="bg-transparent border-dark"
        onChange={handleChange}
        name="status">
        <option>Currency</option>
        <option value="CHF">CHF</option>
        <option value="DOL" disabled>
          Dollar $
        </option>
        <option value="EUR" disabled>
          Euro €
        </option>
      </Form.Select>
      <br />
      <Form.Select
        value={event.lang}
        className="bg-transparent border-dark"
        onChange={handleChange}
        name="status">
        <option>Language</option>
        <option value="en">English</option>
        <option value="de" disabled>
          Allemand
        </option>
        <option value="fr" disabled>
          Français
        </option>
      </Form.Select>
    </>
  );
}
function EditEventInfo() {
  const [event] = useOutletContext();

  //if (!event) return null;
  const editedOn = event.edited?.toDate() ?? new Date(0);
  const createdOn = event.created?.toDate() ?? new Date(0);

  return (
    <>
      <div>
        <QRCode
          value={rootUrl + "e/" + event.id}
          size={150}
          fgColor={statusColors.dark}
          bgColor="transparent"
        />
      </div>
      <hr />
      <p>
        Created on:{" "}
        {createdOn.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}{" "}
        {createdOn.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}
        <br />
        by {event.createdBy}
      </p>
      <p>
        Edited on:{" "}
        {(event.edited?.toDate() ?? new Date(0)).toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}{" "}
        {editedOn.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}
        <br />
        by {event.editedBy}
      </p>
      <p>
        <small className="text-muted">Event ID: {event?.id}</small>
      </p>
      <hr />
    </>
  );
}
function EventDelete({ bgColor, setBgColor, pageTitle, setPageTitle }) {
  const [event, updateEvent] = useOutletContext();

  useEffect(() => {
    setBgColor({
      color: statusColors.admin,
    });
    setPageTitle("Delete event");
    return () => setPageTitle("");
  }, [setBgColor, setPageTitle]);

  function handleClick() {
    console.log("deleted", event.id);
    // updateEvent({ status: value });
  }

  return (
    <>
      <AdminHeader hr buttons {...{ event }} />
      <div className="p-5 mt-5 bg-light" style={{ borderRadius: "20px" }}>
        <p className="text-center">
          Are you sur you want to delete this item ?
        </p>

        <div className="d-flex justify-content-center gap-3">
          <Button variant="danger" size="lg" onClick={handleClick}>
            Delete
          </Button>
          <Button
            as={Link}
            variant="outline-secondary"
            size="lg"
            to="/admin/events/list">
            Oups, no..
          </Button>
        </div>
      </div>
    </>
  );
}

// ****
//PRESENTER
function Presenter({
  bgColor,
  setBgColor,
  fullscreen,
  pageTitle,
  setPageTitle,
}) {
  let { eventId } = useParams();
  const [event, updateEvent, userId] = useOutletContext();
  const fb = useFirebase(event.id, userId);

  const _status = fb.read().status || event.status || "active";

  /*
  const handler = ({ key }) => {
    if (["27", "Escape"].includes(String(key))) {
      console.log("Escape key pressed!");
    }
    if (key === "a") {
      console.log(`${key} key pressed!`);
    }
  };
  useEventListener("keydown", ({ key }) => console.log(key));
  */

  //  BACKGROUND
  useEffect(() => {
    setBgColor({
      color: statusColors[event.status] ?? statusColors.admin,
      text: event.status === "active" ? statusColors.light : statusColors.dark,
      time: ".75s",
    });
    setPageTitle(event.title);
    return () => {
      setPageTitle("");
      setBgColor({});
    };
  }, [event, setBgColor, setPageTitle]);

  return (
    <>
      <AdminHeader status buttons {...{ fullscreen, event }} />

      {_status === "active" && <PresenterPanelActive {...{ event, userId }} />}

      {_status === "onboard" && <PresenterPanelOnboard />}

      {_status === "draft" && <PresenterPanelDraft {...{ eventId, event }} />}

      {_status === "finished" && <PresenterPanelFinished />}
    </>
  );
}
function PresenterPanelDraft({ event, eventId }) {
  return (
    <div className="text-center">
      <div className="mt-5 p-3">
        <QRCode
          value={rootUrl + event.name}
          size={150}
          bgColor="transparent"
          fgColor={event.status === "active" ? "white" : "var(--dark)"}
          renderas="svg"
        />
        <br />
        <span>scan to participate</span>
      </div>
    </div>
  );
}
function PresenterPanelActive({ event, userId }) {
  return (
    <>
      <StreamIncome event={event} userId={userId}>
        <PresenterActiveSVG />
      </StreamIncome>
      <Row>
        <Col></Col>
        <Col></Col>
        <Col>
          <div className="mt-5 p-3 text-center">
            <QRCode
              value={rootUrl + event.name}
              size={180}
              bgColor="transparent"
              fgColor={event.status === "active" ? "white" : "var(--dark)"}
              renderas="svg"
            />
            <br />
            <span>scan to participate</span>
          </div>
        </Col>
      </Row>
    </>
  );
}
function PresenterPanelOnboard() {
  const [bt, setBt] = useState(1);
  const [event] = useOutletContext();
  //console.log("Event trop panel onboard", event);

  const ref = React.useRef();
  useEffect(() => {
    ref.current.focus();
  }, [bt]);

  return (
    <div>
      <div className="responsive-google-slides">
        <iframe
          ref={ref}
          id="iframeslide"
          title="slidesframe"
          src={
            event.slidesid &&
            `https://docs.google.com/presentation/d/${event.slidesid}/embed?start=false&loop=true&rm=minimal`
          }
          frameBorder="0"
          onLoad={(e) => console.log("laoded")}
          allowFullScreen={true}
          mozallowfullscreen="true"
          webkitallowfullscreen="true"
          onFocus={(e) => console.log("focused")}
        />
      </div>
      <Button onClick={(e) => setBt(bt + 1)}>Click me</Button>
    </div>
  );
}
function PresenterPanelFinished() {
  return null;
}

// ****
// REMOTE
function Remote({ bgColor, setBgColor, setPageTitle, pageTitle }) {
  const [event, updateEvent] = useOutletContext();

  useEffect(() => {
    setBgColor({
      color: statusColors.dark,
      text: statusColors.light,
      time: "1s",
    });
    setPageTitle("Remote Controler");
    return () => setPageTitle("");
  }, [setBgColor, setPageTitle]);

  function onChange(value) {
    if (!(value === event.status)) {
      updateEvent({ status: value });
    }
  }

  return (
    <>
      <AdminHeader hr buttons {...{ event }} />
      <ToggleButtonGroup
        type="radio"
        name="statusRadio"
        value={event.status}
        onChange={onChange}
        className="d-flex"
        vertical>
        {["Draft", "Onboard", "Active", "Finished"].map((bt, idx) => {
          return (
            <ToggleButton
              key={"status-btn-" + idx}
              id={"status-btn-" + idx}
              value={bt.toLowerCase()}
              variant="outline-warning shadow-none"
              size="lg">
              {bt}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </>
  );
}

function Admin() {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user || auth.user.isAnonymous || !auth.user.email) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const userId = auth.user.uid;
  const userEmail = auth.user.email;
  return <Outlet context={[userId, userEmail]} />;
}
function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <Link to="/admin/events/list">Manage Events</Link>
      </div>
      <div>
        <Link to="/admin/users">Manage Users</Link>
      </div>
    </div>
  );
}

function EventAdmin() {
  let { eventId } = useParams();
  const [event, setEvent] = useState();
  const [userId, userEmail] = useOutletContext();
  //const auth = useAuth();
  //const userId = auth.user.uid;

  // STREAM EVENT
  useEffect(() => {
    // if (event) return null;
    console.log("streaming event", eventId);
    // if (event) return null;
    const unsubscribe = FirestoreService.stream(
      eventId,
      "events",
      (doc) => {
        if (!doc.metadata.hasPendingWrites) {
          setEvent({ ...doc.data(), id: doc.id });
          console.log("Event mis à jour ! ");
        } else console.log("Pending writes ... ");
      },
      (e) => console.log("Error", e.message)
    );
    return unsubscribe;
  }, [eventId]);

  useEffect(() => {
    console.log("Event Changed", event);
  }, [event]);

  // UPDATE EVENT
  const updateEvent = (data) => {
    if (!event) return null;
    console.log("Event to update", data, event.id, userId);
    // setEvent({...event,...data});
    if (data && event.id) {
      FirestoreService.update(event.id, "events", data, userId)
        .then((doc) => console.log("Event updated!", event.id))
        .catch((e) => console.log(e.message, e.code));
    } else console.log("no data to update!");
  };

  if (!event) return <Loading />;
  return (
    <>
      <Outlet context={[event, updateEvent, userId, userEmail]} />
    </>
  );
}
function UsersList() {
  return <span>List of allowed user and access</span>;
}

/* -------------
******* DATA PROVIDERS ********** 
--------------------- */
/* STREAMERS AND GETTERS */
/*
function StreamEvent({ eventId, children }) {
  const [event, setEvent] = useState({});

  // STREAM EVENT
  useEffect(() => {
    const unsubscribe = FirestoreService.streamEvent(
      eventId,
      (doc) => {
        setEvent(doc.data());
        //setStatus(doc.data().status);
      },
      (error) => console.log("error streaming")
    );
    return unsubscribe;
  }, [eventId]);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { event });
    }
    return child;
  });
  if (!event) return <Loading />;
  return <>{childrenWithProps}</>;
}
*/
function StreamIncome({ event, userId, children }) {
  // const [income, setIncome] = useState([]);
  const fb = useFirebase(event.id, userId);

  const [stats, setStats] = useState({});
  const [nowOnline, setNowOnline] = useState(0);
  // const [participants, setParticipants] = useState(0);

  const _data = fb.read();
  const _nowOnline = fb.countPresence();
  const _countParticipants = fb.countParticipants();

  // STREAM INCOME
  useEffect(() => {
    if (!event.id) return null;
    console.log("Live data has changed", _data, stats);
    const _stats = {
      sum: _data.income,
      support: Math.round(_data.income / 100),
      supported: Math.ceil(_data.income / (30 * 100)),
      participants: fb.countParticipants(),
    };
    setStats({ ..._stats });
    setNowOnline(_nowOnline);
    // setParticipants(_countParticipants);

    /*
    const colRef = `events/${event.id}/incomes`;
    const unsubscribe = FirestoreService.stream(
      "_stats",
      colRef,
      (doc) => {
        console.log("streaming action", doc.data());
        setStats({ id: doc.id, ...doc.data() });
      },
      (error) => console.log("streaming error", error.message)
    );
    return unsubscribe;
    */
  }, [_data, _nowOnline, _countParticipants]);

  // STATS
  /* useEffect(() => {
    const participants = income.length;
    const sum = income
      .map((a) => a.income)
      .reduce((prev, curr) => prev + curr, 0);
    const support = Math.round(sum / 100);
    const supported = Math.round(support / 30);
    setStats({ sum, participants, support, supported });
  }, [income]);
  useEffect(() => {
    console.log(stats, stats.sum, event.sum);
    if (stats.sum && stats.sum !== event.sum) {
      console.log("saving stats");
      const timeoutId = setTimeout(() => {
        FirestoreService.updateEvent(event.id, stats, "presenter")
        .then(() => console.log("stats updated"))
        .catch((e) => console.log("error updating stats", e.message));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [stats]);
  
  */
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        event,
        stats,
        nowOnline,
      });
    }
    return child;
  });

  return <div className="mt-5">{childrenWithProps}</div>;
}
/* -------------
******* COMPONENTS ********** 
--------------------- */

function Loading({ label, mh }) {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: mh ?? "60vh" }}>
      <div className="d-inline-block text-center small text-muted">
        <i className="fa fa-cog fa-spin fa-3x"></i>
        <br />
        {label ?? "Loading"}
      </div>
    </div>
  );
}

function AdminHeader({ event, fullscreen, buttons, title, status, hr, msg }) {
  return (
    <>
      <div className="admin-header d-flex flex-wrap align-items-center mt-2 gap-2">
        <h2 className="text-nobreak">{title ?? event.title}</h2>
        {status && <Badge bg="secondary">{event.status}</Badge>}
        <div className="flex-grow-1"></div>
        {msg && <div className="small mx-3 text-muted">{msg}</div>}
        {fullscreen && <FullScreenToggle {...{ fullscreen }} />}
        {buttons && <ActionButtons eventId={event.id} />}
      </div>
      {hr && <hr />}
    </>
  );
}
function ActionButtons({ eventId }) {
  return (
    <div className="d-inline-flex gap-2">
      {[
        {
          variant: "warning",
          to: `/admin/events/${eventId}/remote`,
          icon: "podcast",
        },
        {
          variant: "warning",
          to: `/admin/events/${eventId}/presenter`,
          icon: "eye",
        },
        {
          variant: "secondary",
          to: `/admin/events/${eventId}/edit`,
          icon: "edit",
        },
        { variant: "secondary", to: `/e/${eventId}`, icon: "play" },
      ].map((el, idx) => {
        return (
          <Button
            key={idx}
            variant={`outline-${el.variant}`}
            as={Link}
            size="sm"
            to={el.to}>
            <i className={`fa fa-${el.icon}`}></i>
          </Button>
        );
      })}
    </div>
  );
}

function FullScreenToggle({ fullscreen }) {
  const handleFullScreen = (e) => {
    if (fullscreen.active) {
      fullscreen.exit();
    } else {
      fullscreen.enter();
    }
  };
  return (
    <Button variant="outline-secondary" size="sm" onClick={handleFullScreen}>
      <i className={fullscreen.active ? "fa fa-times" : "fa fa-arrows-alt"}></i>
    </Button>
  );
}

function PresenterActiveSVG({ event, stats, nowOnline }) {
  const cntsum = useCountUp({
    ref: "cntsum",
    end: stats.sum || 0,
    preserveValue: true,
    useEasing: true,
  });
  const cntpart = useCountUp({
    ref: "cntpart",
    end: stats.participants || 0,
    preserveValue: true,
    useEasing: true,
  });
  const cntsupport = useCountUp({
    ref: "cntsupport",
    end: stats.support || 0,
    delai: 1000,
    duration: 3,
    preserveValue: true,
    useEasing: true,
  });
  const cntsupported = useCountUp({
    ref: "cntsupported",
    end: stats.supported || 0,
    useEasing: true,
    duration: 6,
    delai: 2000,
  });
  useEffect(() => {
    cntsum.update(stats.sum);
    cntpart.update(stats.participants);
    cntsupport.update(stats.support);
    cntsupported.update(stats.supported);
  }, [stats]);

  return (
    <svg className="results" viewBox="0 0 1382 422" fill="none">
      <g>
        <rect width="422" height="422" rx="25" fill="#EDF3FF" />
        <text>
          <tspan x="370" y="147.406" fontSize="48">
            {nowOnline}
          </tspan>
          <tspan x="370" y="174.336" fontSize="20">
            now online
          </tspan>

          <tspan
            id="cntpart"
            x="370"
            y="334.452"
            fontSize="192"
            fontWeight="bold"
            letterSpacing="-4px">
            14
          </tspan>
          <tspan x="370" y="384.366" fontSize="36">
            have participated
          </tspan>
        </text>
      </g>

      <g>
        <rect x="479.619" width="422" height="422" rx="25" fill="#EDF3FF" />
        <text>
          <tspan x="850" y="384.366" fontSize="36" letterSpacing="-0.08em">
            CHF in support / mo
          </tspan>
          <tspan id="cntsum" x="850" y="147.406" fontSize="48">
            100
          </tspan>
        </text>
        <text>
          <tspan x="850" y="174.336" fontSize="20">
            Total monthly income in CHF
          </tspan>
          <tspan
            id="cntsupport"
            x="850"
            y="335.964"
            fontSize="144"
            fontWeight="800"
            letterSpacing="-4px">
            14
          </tspan>
        </text>
      </g>

      <g>
        <rect x="959.238" width="422" height="422" rx="25" fill="#EDF3FF" />
        <text>
          <tspan x="1330" y="174.336" fontSize="20">
            and contribute to
          </tspan>
          <tspan
            id="cntsupported"
            x="1330"
            y="334.452"
            fontSize="192"
            fontWeight="900"
            letterSpacing="-4px">
            14
          </tspan>
        </text>
        <text>
          <tspan x="1330" y="384.366" fontSize="36">
            People
          </tspan>
        </text>
      </g>
    </svg>
  );
}

// OLD_ Active Screen not used anymorefind a better component name
// make a hook !!
function ActiveScreen({ event, stats, nowOnline }) {
  const cntsum = useCountUp({
    ref: "cntsum",
    end: stats.sum || 0,
    preserveValue: true,
    useEasing: true,
  });
  const cntpart = useCountUp({
    ref: "cntpart",
    end: stats.participants || 0,
    preserveValue: true,
    useEasing: true,
  });
  const cntsupport = useCountUp({
    ref: "cntsupport",
    end: stats.support || 0,
    delai: 1000,
    duration: 3,
    preserveValue: true,
    useEasing: true,
  });
  const cntsupported = useCountUp({
    ref: "cntsupported",
    end: stats.supported || 0,
    useEasing: true,
    duration: 6,
    delai: 2000,
  });
  useEffect(() => {
    cntsum.update(stats.sum);
    cntpart.update(stats.participants);
    cntsupport.update(stats.support);
    cntsupported.update(stats.supported);
  }, [stats]);
  /*
  return (
    <div
      className="d-flex flex-column p-5 fs-2"
      style={{ letterSpacing: "-.06rem" }}>
      <div className="fs-1 fw-bolder" style={{ marginLeft: "10%" }}>
        <span id="cntpart" /> participants
      </div>{" "}
      <div style={{ marginLeft: "20%" }}>
        totalize{" "}
        <span className="fw-bolder">
          <span id="cntsum" />
          {event.currency}
        </span>{" "}
        monthly income
      </div>
      <div style={{ marginLeft: "10%" }}>
        <span className="fw-bolder">
          <span className="display-1 fw-bolder" id="cntsupport" />{" "}
          {event.currency}
        </span>{" "}
        total 1% support
      </div>
      <div style={{ marginLeft: "30%" }}>
        <span className="display-1 fw-bolder">
          <span id="cntsupported" /> people{" "}
        </span>
      </div>
      <div style={{ marginLeft: "40%" }}>supported in Sierra Leone</div>
    </div>
  );
  */
  return (
    <div>
      <div>Now online: {nowOnline}</div>
      <svg
        className="results"
        width="100%"
        height="100%"
        viewBox="0 0 1440 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <text>
          <tspan x="700" y="282.476">
            Group total amount
          </tspan>
          <tspan x="700" y="417.476">
            Total 1% support
          </tspan>
          <tspan x="700" y="552.476">
            Participants
          </tspan>
          <tspan x="700" y="687.476">
            Total people helped
          </tspan>
        </text>
        <text className="big">
          <tspan id="cntsum" x="433" y="282.476"></tspan>
          <tspan id="cntsupport" x="433" y="417.476"></tspan>
          <tspan id="cntpart" x="433" y="552.476"></tspan>
          <tspan id="cntsupported" x="433" y="687.476"></tspan>
        </text>
        <text className="labels">
          <tspan id="cntsum" x="460" y="282.476">
            {event.currency}
          </tspan>
          <tspan id="cntsupport" x="460" y="417.476">
            {event.currency}
          </tspan>
          <tspan id="cntpart" x="460" y="552.476">
            X
          </tspan>
          <tspan id="cntsupported" x="460" y="687.476">
            X
          </tspan>
        </text>
      </svg>
    </div>
  );
}

export default App;
