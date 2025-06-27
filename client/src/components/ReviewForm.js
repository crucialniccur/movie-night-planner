import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";

function ReviewForm() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get("event_id");

  return (
    <div>
      <h1>Submit a Review {eventId ? `for Event ${eventId}` : ""}</h1>
      <Formik
        initialValues={{ content: "", rating: "" }}
        validate={(values) => {
          const errors = {};
          if (!values.content) errors.content = "Comment is required";
          if (!values.rating) {
            errors.rating = "Rating is required";
          } else if (values.rating < 1 || values.rating > 5) {
            errors.rating = "Rating must be between 1 and 5";
          }
          return errors;
        }}
        onSubmit={(values, { setSubmitting }) => {
          fetch("/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...values, event_id: eventId }),
          })
            .then((res) => res.json())
            .then((data) => console.log("Review submitted:", data))
            .catch((error) => console.error("Error:", error));
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div>
              <label>Comment</label>
              <Field name="content" type="text" />
              <ErrorMessage name="content" component="div" />
            </div>
            <div>
              <label>Rating (1-5)</label>
              <Field name="rating" type="number" />
              <ErrorMessage name="rating" component="div" />
            </div>
            <button type="submit" disabled={isSubmitting || !eventId}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default ReviewForm;
