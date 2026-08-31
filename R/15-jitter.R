## Compara el jitter uniforme actual con uno cuyo radio crece como la raíz del
## conteo, de modo que el ÁREA de cada mancha sea proporcional a cuánta gente hay.
suppressMessages({library(dplyr); library(ggplot2)})
source("R/10-datos.R"); set.seed(2026)
b <- cargar()[, c("insc1","apro1","clase")]

cel <- b |> count(insc1, apro1, clase, name = "n")
nmax <- max(b |> count(insc1, apro1) |> pull(n))
R_MAX <- 0.46                      # tope: que dos celdas vecinas no se toquen

esparcir <- function(df, radio) {
  df |> group_by(insc1, apro1, clase) |> group_modify(function(g, k) {
    m <- g$n[1]
    r <- radio(m)
    th <- runif(m, 0, 2*pi); rad <- r * sqrt(runif(m))
    tibble(x = k$insc1 + rad*cos(th), y = k$apro1 + rad*sin(th))
  }) |> ungroup()
}

## celda -> total de personas (para el radio hay que mirar la celda entera,
## no cada clase por separado, o las celdas mixtas se inflarían)
tot <- b |> count(insc1, apro1, name = "ntot")
cel <- cel |> left_join(tot, by = c("insc1","apro1"))

unif <- cel |> group_by(insc1, apro1, clase) |> group_modify(function(g,k){
  m <- g$n[1]; tibble(x = k$insc1 + runif(m,-.28,.28), y = k$apro1 + runif(m,-.28,.28)) }) |>
  ungroup() |> mutate(panel = "Actual: jitter uniforme")

prop <- cel |> group_by(insc1, apro1, clase) |> group_modify(function(g,k){
  m <- g$n[1]; r <- R_MAX * sqrt(g$ntot[1] / nmax)
  th <- runif(m,0,2*pi); rad <- r*sqrt(runif(m))
  tibble(x = k$insc1 + rad*cos(th), y = k$apro1 + rad*sin(th)) }) |>
  ungroup() |> mutate(panel = "Propuesto: área ∝ cantidad")

d <- bind_rows(unif, prop)
d$panel <- factor(d$panel, unique(d$panel))

p <- ggplot(d, aes(x, y, colour = clase)) +
  geom_point(size = 1.5, alpha = .5, stroke = 0) +
  geom_abline(slope = 0.785, intercept = 0, linetype = "dashed", colour = "grey25", linewidth = .8) +
  facet_wrap(~panel) +
  scale_colour_manual(values = COL) +
  coord_fixed(xlim = c(-0.7, 15.7), ylim = c(-0.7, 15.7), expand = FALSE) +
  labs(x = "Materias en las que se inscribió", y = "Materias que aprobó") +
  guides(colour = guide_legend(override.aes = list(size = 6, alpha = 1))) +
  tema(22)
ggsave("img/S6-jitter-comparacion.png", p, width = 15, height = 8.4, dpi = 200,
       bg = "white", type = "cairo")
cat("celda más poblada:", nmax, "personas · radio máximo:", R_MAX, "\n")
cat("celda de 1 persona -> radio", round(R_MAX*sqrt(1/nmax), 4), "\n")
cat("guardado\n")
