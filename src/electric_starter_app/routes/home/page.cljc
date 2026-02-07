(ns electric-starter-app.routes.home.page
  (:require [hyperfiddle.electric3 :as e]
            [hyperfiddle.electric-dom3 :as dom]))

(e/defn Page []
  (e/client
    (dom/h1 (dom/text "Electric Starter App"))
    (dom/p (dom/text "Welcome! Try these routes:"))
    (dom/ul
      (dom/li (dom/a (dom/props {:href "/two-clocks"}) (dom/text "/two-clocks")))
      (dom/li (dom/a (dom/props {:href "/about"}) (dom/text "/about"))))))
