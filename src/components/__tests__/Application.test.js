import React from "react";

import { render, cleanup, waitForElement, fireEvent, getByText, getAllByTestId, getByAltText, getByPlaceholderText, queryByText, queryByAltText } from "@testing-library/react";

import Application from "components/Application";
import axios from "axios";

afterEach(cleanup);

describe("Application", () => {

  it("changes the schedule when a new day is selected", async () => {
    const { getByText } = render(<Application />);

    await waitForElement(() => getByText("Monday"));

    fireEvent.click(getByText("Tuesday"));

    expect(getByText("Leopold Silvers")).toBeInTheDocument();
  });

  it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
    const { container } = render(<Application />);
  
    await waitForElement(() => getByText(container, "Archie Cohen"));
  
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];
  
    fireEvent.click(getByAltText(appointment, "Add"));
  
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" }
    });
  
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    fireEvent.click(getByText(appointment, "Save"));
  
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
  
    await waitForElement(() => getByText(appointment, "Lydia Miller-Jones"));
  
    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );
  
    expect(getByText(day, "no spots remaining")).toBeInTheDocument();
  });

  it("loads data, cancels an interview and increases the spots remaining for Monday by 1", async () => {
    // 1. Render the Application.
    const { container } = render(<Application />);
  
    // 2. Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));
  
    // 3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
  
    fireEvent.click(queryByAltText(appointment, "Delete"));
  
    // 4. Check that the confirmation message is shown.
    expect(getByText(appointment, "Are you sure you would like to delete?")).toBeInTheDocument();

    // 5. Click the "Confirm" button on the confirmation.
   fireEvent.click(queryByText(appointment, "Confirm"));

    // 6. Check that the element with the text "Deleting" is displayed.
   expect(getByText(appointment, "Deleting")).toBeInTheDocument();

    // 7. Wait until the element with the "Add" button is displayed.
    await waitForElement(() => getByAltText(appointment, "Add"));

    // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    )
    expect(getByText(day, "2 spots remaining")).toBeInTheDocument();
  });

  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    // We want to start by finding an existing interview.
    // With the existing interview we want to find the edit button.
    // We change the name and save the interview.
    // We don't want the spots to change for "Monday", since this is an edit.
    // Read the errors because sometimes they say that await cannot be outside of an async function.

     // Render the Application.
    const { container } = render(<Application />);

    // Wait until the text of the existing interview is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));

    // Find the existing interview to edit.
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );

    // Click the "Edit" button on the existing appointment.
    fireEvent.click(queryByAltText(appointment, "Edit"));

    // Change the name of the student.
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "New Student Name" }
    });

    // Click the "Save" button to save the changes.
    fireEvent.click(getByText(appointment, "Save"));

    // Check that the saving process is in progress.
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    // Wait until the changes are reflected in the UI.
    await waitForElement(() => getByText(appointment, "New Student Name"));

    // Check that the spots for Monday remain the same.
    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, "1 spot remaining")).toBeInTheDocument();
  })

  it("shows the save error when failing to save an appointment", async () => {
    // Mock the Axios PUT request to reject once.
    axios.put.mockRejectedValueOnce();
  
    // Render the Application.
    const { container } = render(<Application />);
  
    // Wait until the text of the existing interview is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));
  
    // Find the existing interview.
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
  
    // Click the "Edit" button on the existing appointment.
    fireEvent.click(queryByAltText(appointment, "Edit"));
  
    // Change the name of the student.
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "New Student Name" }
    });
  
    // Click the "Save" button to save the changes.
    fireEvent.click(getByText(appointment, "Save"));
  
    // Check that the error message is displayed.
    await waitForElement(() => getByText(appointment, "Could not book appointment."));
  });
  


  it("shows the delete error when failing to delete an existing appointment", async () => {
    // Mock the Axios DELETE request to reject once.
    axios.delete.mockRejectedValueOnce();
  
    // Render the Application.
    const { container } = render(<Application />);
  
    // Wait until the text of the existing interview is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));
  
    // Find the existing interview to delete.
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
  
    // Click the "Delete" button on the appointment.
    fireEvent.click(queryByAltText(appointment, "Delete"));
  
    // Click the "Confirm" button on the confirmation dialog.
    fireEvent.click(getByText(appointment, "Confirm"));
  
    // Check that the error message is displayed.
    await waitForElement(() => getByText(appointment, "Could not cancel appointment."));
  });
});