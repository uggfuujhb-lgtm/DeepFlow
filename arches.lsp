;;; ARCHES.LSP - Draws 4 types of brick arches
;;; Flat / French(Dutch) / Semi-circular / Segmental
;;; Usage: APPLOAD -> load this file -> type ARCHES

(defun ar:ln (a b)
  (entmake (list '(0 . "LINE") (cons 10 a) (cons 11 b)))
)

(defun ar:arc (c r a1 a2)
  (entmake (list '(0 . "ARC") (cons 10 c) (cons 40 r) (cons 50 a1) (cons 51 a2)))
)

(defun ar:txt (p s)
  (entmake (list '(0 . "TEXT") (cons 10 p) (cons 40 80.0) (cons 1 s)))
)

(defun ar:asin (v) (atan v (sqrt (- 1.0 (* v v)))))

(defun ar:jambs (x y s h)
  (ar:ln (list x y 0.0) (list x (+ y h) 0.0))
  (ar:ln (list (+ x s) y 0.0) (list (+ x s) (+ y h) 0.0))
)

;; ---------- Semi-circular arch ----------
(defun ar:semi (x y s h d n / c r i a)
  (ar:jambs x y s h)
  (setq c (list (+ x (/ s 2.0)) (+ y h) 0.0)
        r (/ s 2.0))
  (ar:arc c r 0.0 pi)
  (ar:arc c (+ r d) 0.0 pi)
  (setq i 0)
  (while (<= i n)
    (setq a (* pi (/ (float i) n)))
    (ar:ln (polar c a r) (polar c a (+ r d)))
    (setq i (1+ i))
  )
  (ar:txt (list x (- y 200.0) 0.0) "Semi-circular Arch")
)

;; ---------- Segmental arch ----------
(defun ar:seg (x y s h d n / rise r c th a1 a2 i a)
  (ar:jambs x y s h)
  (setq rise (/ s 6.0)
        r    (/ (+ (* s s 0.25) (* rise rise)) (* 2.0 rise))
        c    (list (+ x (/ s 2.0)) (- (+ y h rise) r) 0.0)
        th   (ar:asin (/ (/ s 2.0) r))
        a1   (- (/ pi 2.0) th)
        a2   (+ (/ pi 2.0) th))
  (ar:arc c r a1 a2)
  (ar:arc c (+ r d) a1 a2)
  (setq i 0)
  (while (<= i n)
    (setq a (+ a1 (* (- a2 a1) (/ (float i) n))))
    (ar:ln (polar c a r) (polar c a (+ r d)))
    (setq i (1+ i))
  )
  ;; construction lines to centre (like the slide)
  (ar:ln c (polar c a1 r))
  (ar:ln c (polar c a2 r))
  (ar:txt (list x (- y 200.0) 0.0) "Segmental Arch")
)

;; ---------- Flat arch ----------
(defun ar:flat (x y s h d n / hb c i a)
  (ar:jambs x y s h)
  (setq hb (* (/ s 2.0) (sqrt 3.0))            ; equilateral triangle height
        c  (list (+ x (/ s 2.0)) (- (+ y h) hb) 0.0))
  (ar:ln (list x (+ y h) 0.0) (list (+ x s) (+ y h) 0.0))   ; soffit
  (ar:ln (polar c (/ pi 3.0) (/ (+ hb d) (sin (/ pi 3.0))))
         (polar c (/ (* 2.0 pi) 3.0) (/ (+ hb d) (sin (/ pi 3.0)))))   ; top
  (setq i 0)
  (while (<= i n)
    (setq a (+ (/ pi 3.0) (* (/ pi 3.0) (/ (float i) n))))
    (ar:ln (polar c a (/ hb (sin a))) (polar c a (/ (+ hb d) (sin a))))
    (setq i (1+ i))
  )
  (ar:ln c (list x (+ y h) 0.0))
  (ar:ln c (list (+ x s) (+ y h) 0.0))
  (ar:txt (list x (- y 200.0) 0.0) "Flat Arch")
)

;; ---------- French / Dutch arch ----------
(defun ar:dutch (x y s h d / hb cx cy nc cd k yk yk1 hw off m xj)
  (ar:jambs x y s h)
  (setq hb (* (/ s 2.0) (sqrt 3.0))
        cx (+ x (/ s 2.0))
        cy (- (+ y h) hb)
        nc (max 1 (fix (+ 0.5 (/ d 75.0))))     ; number of brick courses
        cd (/ d nc))
  ;; skewbacks
  (ar:ln (list x (+ y h) 0.0)
         (list (- cx (/ (+ hb d) (sqrt 3.0))) (+ y h d) 0.0))
  (ar:ln (list (+ x s) (+ y h) 0.0)
         (list (+ cx (/ (+ hb d) (sqrt 3.0))) (+ y h d) 0.0))
  ;; horizontal courses
  (setq k 0)
  (while (<= k nc)
    (setq yk (+ y h (* k cd))
          hw (/ (- yk cy) (sqrt 3.0)))
    (ar:ln (list (- cx hw) yk 0.0) (list (+ cx hw) yk 0.0))
    (setq k (1+ k))
  )
  ;; vertical joints (stretcher bond)
  (setq k 0)
  (while (< k nc)
    (setq yk  (+ y h (* k cd))
          yk1 (+ yk cd)
          hw  (/ (- yk cy) (sqrt 3.0))
          off (if (= (rem k 2) 0) 0.0 115.0)
          m   -20)
    (while (<= m 20)
      (setq xj (+ cx off (* m 230.0)))
      (if (and (> xj (- cx hw)) (< xj (+ cx hw)))
        (ar:ln (list xj yk 0.0) (list xj yk1 0.0)))
      (setq m (1+ m))
    )
    (setq k (1+ k))
  )
  (ar:txt (list x (- y 200.0) 0.0) "French or Dutch Arch")
)

;; ---------- Main command ----------
(defun c:ARCHES (/ p s x y h d)
  (setq s (getdist "\nOpening span <1000>: "))
  (if (not s) (setq s 1000.0))
  (setq h 1200.0      ; jamb height
        d 230.0)      ; arch depth (one brick)
  (setq p (getpoint "\nPick base point: "))
  (if p
    (progn
      (setq x (car p) y (cadr p))
      (ar:flat  x                     (+ y 3500.0) s h d 11)
      (ar:dutch (+ x (* 2.0 s) 1000.0) (+ y 3500.0) s h d)
      (ar:semi  x                     y            s h d 21)
      (ar:seg   (+ x (* 2.0 s) 1000.0) y            s h d 15)
      (command "_.ZOOM" "_E")
      (princ "\nDone. Add brick wall with HATCH > AR-B816.")
    )
  )
  (princ)
)

(princ "\nType ARCHES to draw the four arch types.")
(princ)
