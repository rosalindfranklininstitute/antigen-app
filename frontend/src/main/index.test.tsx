import { render, screen } from "@testing-library/react";
import App from ".";

test("renders header", () => {
  render(<App />);
  const headerText = screen.getByText(/Antigen App/);
  expect(headerText).toBeInTheDocument();
});
