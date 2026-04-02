.PHONY: help install test build clean lint format-check release-check

PNPM ?= pnpm

help:
	@echo "targets: install test build clean lint format-check release-check"

install:
	$(PNPM) install

test:
	$(PNPM) test

build:
	$(PNPM) run build

clean:
	rm -rf dist

lint:
	$(PNPM) run lint

format-check:
	$(PNPM) run format:check

release-check: clean lint format-check build test
	@echo "release-check: ok"
