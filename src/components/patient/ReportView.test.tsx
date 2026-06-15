import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ReportView } from "./ReportView";

describe("ReportView", () => {
  it("submits the completed symptom report before showing confirmation", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onOpenMessages = vi.fn();

    render(<ReportView rehabItems={[{ name: "Quad Sets" }]} onSubmit={onSubmit} onOpenMessages={onOpenMessages} />);

    await user.click(screen.getByRole("button", { name: "Quad Sets" }));
    await user.click(screen.getAllByRole("button", { name: "3" })[0]);
    await user.click(screen.getAllByRole("button", { name: "2" })[1]);
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByRole("button", { name: "Front of knee" }));
    await user.type(screen.getByRole("textbox"), "Sharp pain during the last rep");
    await user.click(screen.getByRole("button", { name: /send to dr\. rivera/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      exercise: "Quad Sets",
      pain: 3,
      swelling: 2,
      location: "Front of knee",
      note: "Sharp pain during the last rep",
    });
    expect(screen.getByText("REPORT SENT")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /view in pt messages/i }));
    expect(onOpenMessages).toHaveBeenCalledOnce();
  });
});
