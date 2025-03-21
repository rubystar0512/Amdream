import { Button } from "antd";
import styled from "styled-components";
import { motion } from "framer-motion";

const NotFoundContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled(motion.h1)`
  font-size: 120px;
  margin: 0;
  background: linear-gradient(45deg, #12c2e9, #c471ed, #f64f59);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
`;

const SubTitle = styled(motion.p)`
  font-size: 24px;
  color: #666;
  margin: 20px 0 30px;
`;

const StyledButton = styled(Button)`
  height: 45px;
  padding: 0 35px;
  font-size: 16px;
  border-radius: 25px;
  background: linear-gradient(45deg, #12c2e9, #c471ed);
  border: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    background: linear-gradient(45deg, #11b3d8, #b366db);
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Title
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        404
      </Title>
      <SubTitle
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        Oops! The page you're looking for doesn't exist.
      </SubTitle>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <StyledButton type="primary" href="/">
          Back to Home
        </StyledButton>
      </motion.div>
    </NotFoundContainer>
  );
};

export default NotFound;
