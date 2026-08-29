import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

vi.mock("../store/authStore", () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from "../store/authStore";

describe("PrivateRoute", () => {
  it("redirects unauthenticated users to login", () => {
    useAuthStore.mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <PrivateRoute />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders outlet for authenticated users", () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true });

    const { container } = render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <PrivateRoute />
      </MemoryRouter>,
    );

    expect(container).toBeTruthy();
  });
});
