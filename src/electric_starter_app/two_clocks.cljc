(ns electric-starter-app.two-clocks
  (:require [hyperfiddle.electric3 :as e]
            [hyperfiddle.electric-dom3 :as dom]))

(e/defn TwoClocks []
  (e/client
    (let [s (e/server (e/System-time-ms))
          c (e/client (e/System-time-ms))]
      (dom/dl
        (dom/dt (dom/text "server time"))
        (dom/dd (dom/text s))
        (dom/dt (dom/text "client time"))
        (dom/dd (dom/text c))
        (dom/dt (dom/text "skew"))
        (dom/dd (dom/text (- s c)))))))