########################################################################################################

SHELL = bash
VERSION = $(shell jq -r '.version' package.json)
NAME = $(shell jq -r '.name' package.json)
DESC = $(shell jq -r '.description' package.json)
WORKSPACE = pkg

.PHONY: clean all

########################################################################################################

all: zimbra-zimlet-pkg
	rm -rf build/stage build/tmp
	cd build/dist/[ucr]* && \
	if [ -f "/etc/redhat-release" ]; \
	then \
		createrepo '.'; \
	else \
		dpkg-scanpackages '.' /dev/null > Packages; \
	fi

########################################################################################################

create-zip:
	npm install --no-audit
	npm run build
	npm run package

stage-zimlet-zip:
	install -T -D $(WORKSPACE)/$(NAME).zip  build/stage/$(NAME)/opt/zimbra/zimlets-network/$(NAME).zip

zimbra-zimlet-pkg: stage-zimlet-zip
	../zm-pkg-tool/pkg-build.pl \
		--out-type=binary \
		--pkg-version=$(VERSION).$(shell git log --pretty=format:%ct -1) \
		--pkg-release=1 \
		--pkg-name=$(NAME) \
		--pkg-summary=$(DESC) \
		--pkg-depends='zimbra-network-store (>= 8.8.15)' \
		--pkg-post-install-script='scripts/postinst.sh'\
		--pkg-installs='/opt/zimbra/zimlets-network/$(NAME).zip'

########################################################################################################

clean:
	rm -rf build
	rm -rf downloads

########################################################################################################
