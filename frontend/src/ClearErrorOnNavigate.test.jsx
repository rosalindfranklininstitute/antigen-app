import React from "react";
import { render, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router";
import ClearErrorOnNavigate from "./ClearErrorOnNavigate";

const NavButton = ({ to }) => {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)}>go</button>;
};

function setup(setError) {
  return render(
    <MemoryRouter
      initialEntries={["/a"]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ClearErrorOnNavigate setError={setError} />
      <Routes>
        <Route path="/a" element={<NavButton to="/b" />} />
        <Route path="/b" element={<div>page b</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

it("calls setError(null) when the pathname changes", async () => {
  const setError = vi.fn();
  const { getByText } = setup(setError);

  await act(async () => {
    getByText("go").click();
  });

  expect(setError).toHaveBeenLastCalledWith(null);
});

it("calls setError(null) on initial mount", () => {
  const setError = vi.fn();
  setup(setError);
  expect(setError).toHaveBeenCalledWith(null);
});
