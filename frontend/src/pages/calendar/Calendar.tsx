import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import { Button, Calendar as AntdCalendar, Card, Row, Col } from "antd";
import { Button as FlowButton } from "flowbite-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const App: React.FC = () => {
  const [events] = React.useState([
    {
      start: moment().toDate(),
      end: moment().add(1, "days").toDate(),
      title: "Some title",
    },
  ]);

  const customHeaderRenderer = ({ value, onChange }: any) => {
    const current = value.clone();
    return (
      <div style={{ padding: 8, background: "#1b1b1b" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "white", fontSize: "16px" }}>
            {current.format("MMMM YYYY")}
          </div>
          <div>
            <Button
              type="text"
              onClick={() => onChange(current.clone().subtract(1, "month"))}
              icon={<span>&#8249;</span>}
              style={{ color: "white" }}
            />
            <Button
              type="text"
              onClick={() => onChange(current.clone().add(1, "month"))}
              icon={<span>&#8250;</span>}
              style={{ color: "white" }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card
      className="calendar-card"
      style={{
        width: "72vw",
        height: "80vh",
        backgroundColor: "#1b1b1b",
        border: "gray",
      }}
    >
      <Row justify="space-between" align="top" gutter={44}>
        <Col span={5}>
          <Row justify={"space-between"} align={"top"}>
            <FlowButton className="w-[100%] flex-none align-middle">
              + Create
            </FlowButton>
            <div className="dark-calendar">
              <AntdCalendar
                fullscreen={false}
                headerRender={customHeaderRenderer}
                style={{
                  background: "#1b1b1b",
                  color: "white",
                }}
              />
            </div>
          </Row>
        </Col>
        <Col span={19}>
          <Calendar
            localizer={localizer}
            defaultDate={new Date()}
            defaultView="month"
            events={events}
            style={{ height: "76vh" }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default App;
