(ns electric-starter-app.routes.about.page
  (:require [hyperfiddle.electric3 :as e]
            [hyperfiddle.electric-dom3 :as dom]))

(e/defn Page []
  (e/client
    (dom/h1 (dom/text "About"))
    (dom/p (dom/text "Electric starter app with file-based routing."))))
